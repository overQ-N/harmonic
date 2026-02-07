/**
 * HTTP Request Library Usage Examples
 */

import HttpClient, { http } from "@/lib/http";

// ============ 基础用法 ============

// 1. GET 请求
async function getExample() {
  try {
    const response = await http.get("/api/users");
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// 2. POST 请求
async function postExample() {
  try {
    const response = await http.post("/api/users", {
      name: "John",
      email: "john@example.com",
    });
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// 3. PUT 请求
async function putExample() {
  try {
    const response = await http.put("/api/users/1", {
      name: "Jane",
    });
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// 4. DELETE 请求
async function deleteExample() {
  try {
    const response = await http.delete("/api/users/1");
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============ 高级用法 ============

// 5. 带查询参数的请求
async function withParamsExample() {
  try {
    const response = await http.get("/api/users", {
      params: { page: 1, limit: 10, search: "John" },
    });
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// 6. 带自定义超时的请求
async function withTimeoutExample() {
  try {
    const response = await http.get("/api/slow-endpoint", {
      timeout: 5000, // 5秒
    });
    console.log(response.data);
  } catch (error) {
    if ((error as any).isTimeout) {
      console.error("Request timed out");
    }
  }
}

// 7. 带重试的请求
async function withRetryExample() {
  try {
    const response = await http.get("/api/users", {
      retry: 3, // 失败后重试3次
      retryDelay: 1000, // 每次重试延迟1秒
    });
    console.log(response.data);
  } catch (error) {
    console.error("Error after retries:", error);
  }
}

// 8. 请求取消
async function cancellationExample() {
  const { signal, cancel } = http.createCancelToken();

  const requestPromise = http.get("/api/users", { signal });

  // 2秒后取消请求
  setTimeout(() => {
    cancel("User cancelled the request");
  }, 2000);

  try {
    const response = await requestPromise;
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// 9. 创建自定义实例
function customInstanceExample() {
  const apiClient = new HttpClient({
    baseURL: "https://api.example.com",
    timeout: 20000,
    retry: 2,
    retryDelay: 500,
  });

  return apiClient;
}

// ============ 拦截器 ============

// 10. 配置请求拦截器（如添加token）
function setupRequestInterceptor() {
  http.addRequestInterceptor(async config => {
    // 添加认证token
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

// 11. 配置响应拦截器
function setupResponseInterceptor() {
  http.addResponseInterceptor(async response => {
    // 可以在这里处理响应数据
    console.log("Response received:", response.status);
    return response;
  });
}

// 12. 配置错误拦截器
function setupErrorInterceptor() {
  http.addErrorInterceptor(error => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      console.error("Unauthorized! Redirect to login");
      // window.location.href = '/login';
    } else if (error.isTimeout) {
      console.error("Request timeout");
    }
    // 可以返回处理后的值，或继续抛出错误
    return Promise.reject(error);
  });
}

// ============ 实际应用示例 ============

// 13. API 服务类示例
class UserService {
  private baseURL = "/api/users";

  async getUsers(page: number = 1, limit: number = 10) {
    const response = await http.get<{ users: any[]; total: number }>(this.baseURL, {
      params: { page, limit },
      timeout: 10000,
    });
    return response.data;
  }

  async getUserById(id: string) {
    const response = await http.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async createUser(userData: any) {
    const response = await http.post(this.baseURL, userData);
    return response.data;
  }

  async updateUser(id: string, userData: any) {
    const response = await http.put(`${this.baseURL}/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string) {
    await http.delete(`${this.baseURL}/${id}`);
  }
}

// 14. 初始化应用HTTP配置
export function initializeHttp() {
  // 设置基础配置
  http.setDefaults({
    baseURL: "https://api.example.com",
    timeout: 30000,
    retry: 1,
  });

  // 设置请求拦截器
  setupRequestInterceptor();

  // 设置响应拦截器
  setupResponseInterceptor();

  // 设置错误拦截器
  setupErrorInterceptor();
}

export { UserService };
