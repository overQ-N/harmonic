/**
 * HTTP Request Library - Based on Fetch API
 * Features: Retry, Timeout, Cancellation, Interceptors, Axios-like API
 */

export interface RequestConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  timeout?: number; // ms
  retry?: number; // retry count
  retryDelay?: number; // ms
  signal?: AbortSignal; // for cancellation
}

export interface ResponseData<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: RequestConfig;
}

export interface HttpError extends Error {
  response?: ResponseData;
  code?: string;
  config?: RequestConfig;
  isTimeout?: boolean;
  isCancel?: boolean;
}

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = <T>(
  response: ResponseData<T>
) => ResponseData<T> | Promise<ResponseData<T>>;
type ErrorInterceptor = (error: HttpError) => any;

interface InterceptorHandlers {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
  error: ErrorInterceptor[];
}

class HttpClient {
  private baseURL: string = "";
  private timeout: number = 30000; // default 30s
  private retry: number = 0;
  private retryDelay: number = 1000;
  private interceptors: InterceptorHandlers = {
    request: [],
    response: [],
    error: [],
  };

  constructor(config?: {
    baseURL?: string;
    timeout?: number;
    retry?: number;
    retryDelay?: number;
  }) {
    if (config?.baseURL) this.baseURL = config.baseURL;
    if (config?.timeout) this.timeout = config.timeout;
    if (config?.retry) this.retry = config.retry;
    if (config?.retryDelay) this.retryDelay = config.retryDelay;
  }

  /**
   * Build URL with base URL and params
   */
  private buildUrl(url: string, params?: Record<string, any>): string {
    const fullUrl = url.startsWith("http") ? url : this.baseURL + url;
    if (!params) return fullUrl;

    const queryStr = Object.entries(params)
      .map(([key, value]) => {
        if (value === null || value === undefined) return null;
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .filter(Boolean)
      .join("&");

    return queryStr ? `${fullUrl}?${queryStr}` : fullUrl;
  }

  /**
   * Handle timeout with AbortController
   */
  private createTimeoutSignal(timeout: number, signal?: AbortSignal): AbortSignal {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Handle both controller timeout and external abort
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        controller.abort();
      });
    }

    return controller.signal;
  }

  /**
   * Request with retry logic
   */
  private async requestWithRetry(
    url: string,
    options: RequestInit,
    retryCount: number = 0,
    maxRetry: number = this.retry
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (retryCount < maxRetry) {
        await this.delay(this.retryDelay);
        return this.requestWithRetry(url, options, retryCount + 1, maxRetry);
      }
      throw error;
    }
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute request with interceptors
   */
  private async executeRequest<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    // Apply request interceptors
    let finalConfig = config;
    for (const interceptor of this.interceptors.request) {
      finalConfig = await interceptor(finalConfig);
    }

    const {
      url,
      method = "GET",
      headers = {},
      data,
      timeout = this.timeout,
      retry = this.retry,
      signal,
    } = finalConfig;

    // Build full URL
    const fullUrl = this.buildUrl(url, finalConfig.params);

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: this.createTimeoutSignal(timeout, signal),
    };

    if (data) {
      fetchOptions.body = typeof data === "string" ? data : JSON.stringify(data);
    }

    try {
      // Fetch with retry
      const response = await this.requestWithRetry(fullUrl, fetchOptions, 0, retry);

      let responseData: any;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else if (contentType?.includes("text")) {
        responseData = await response.text();
      } else {
        responseData = await response.blob();
      }

      const responseObj: ResponseData<T> = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: finalConfig,
      };

      // Check if status indicates error
      if (!response.ok) {
        const error = this.createHttpError(responseObj);
        throw error;
      }

      // Apply response interceptors
      let finalResponse = responseObj;
      for (const interceptor of this.interceptors.response) {
        finalResponse = await interceptor(finalResponse);
      }

      return finalResponse;
    } catch (error) {
      // Handle different error types
      const httpError = this.normalizeError(error, finalConfig);

      // Apply error interceptors
      for (const interceptor of this.interceptors.error) {
        try {
          await interceptor(httpError);
        } catch {
          // Continue with error chain
        }
      }

      throw httpError;
    }
  }

  /**
   * Create HTTP error from response
   */
  private createHttpError(response: ResponseData): HttpError {
    const error = new Error(`Request failed with status ${response.status}`) as HttpError;
    error.response = response;
    error.config = response.config;
    error.code = `HTTP_${response.status}`;
    return error;
  }

  /**
   * Normalize different error types
   */
  private normalizeError(error: any, config: RequestConfig): HttpError {
    let httpError: HttpError;

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        httpError = new Error("Request timeout") as HttpError;
        httpError.isTimeout = true;
      } else {
        httpError = error as HttpError;
      }
    } else {
      httpError = new Error(String(error)) as HttpError;
    }

    httpError.config = config;
    if (!httpError.code) {
      httpError.code = httpError.isTimeout ? "TIMEOUT" : "NETWORK_ERROR";
    }

    return httpError;
  }

  /**
   * Request method
   */
  async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    return this.executeRequest<T>(config);
  }

  /**
   * GET method
   */
  async get<T = any>(
    url: string,
    config?: Omit<RequestConfig, "url" | "method">
  ): Promise<ResponseData<T>> {
    return this.executeRequest<T>({ ...config, url, method: "GET" });
  }

  /**
   * POST method
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ResponseData<T>> {
    return this.executeRequest<T>({ ...config, url, method: "POST", data });
  }

  /**
   * PUT method
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ResponseData<T>> {
    return this.executeRequest<T>({ ...config, url, method: "PUT", data });
  }

  /**
   * DELETE method
   */
  async delete<T = any>(
    url: string,
    config?: Omit<RequestConfig, "url" | "method">
  ): Promise<ResponseData<T>> {
    return this.executeRequest<T>({ ...config, url, method: "DELETE" });
  }

  /**
   * PATCH method
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ResponseData<T>> {
    return this.executeRequest<T>({ ...config, url, method: "PATCH", data });
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.interceptors.request.push(interceptor);
    return () => {
      this.interceptors.request = this.interceptors.request.filter(i => i !== interceptor);
    };
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.interceptors.response.push(interceptor);
    return () => {
      this.interceptors.response = this.interceptors.response.filter(i => i !== interceptor);
    };
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.interceptors.error.push(interceptor);
    return () => {
      this.interceptors.error = this.interceptors.error.filter(i => i !== interceptor);
    };
  }

  /**
   * Create CancelToken for request cancellation
   */
  createCancelToken(): { signal: AbortSignal; cancel: (reason?: string) => void } {
    const controller = new AbortController();
    return {
      signal: controller.signal,
      cancel: (reason?: string) => controller.abort(reason),
    };
  }

  /**
   * Update default config
   */
  setDefaults(config: {
    baseURL?: string;
    timeout?: number;
    retry?: number;
    retryDelay?: number;
  }): void {
    if (config.baseURL) this.baseURL = config.baseURL;
    if (config.timeout) this.timeout = config.timeout;
    if (config.retry) this.retry = config.retry;
    if (config.retryDelay) this.retryDelay = config.retryDelay;
  }
}

// Create default instance
export const http = new HttpClient();

// Export class for creating custom instances
export default HttpClient;
