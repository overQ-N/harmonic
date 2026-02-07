import HttpClient from "./http";

export function initializeHttp() {
  const http = new HttpClient();
  // 设置基础配置
  http.setDefaults({
    baseURL: "https://kw-api.cenguigui.cn",
    timeout: 30000,
    retry: 1,
  });

  // 设置请求拦截器
  setupRequestInterceptor();

  // 设置响应拦截器
  // setupResponseInterceptor();

  // 设置错误拦截器
  // setupErrorInterceptor();

  function setupRequestInterceptor() {
    http.addRequestInterceptor(async config => {
      config.headers = config.headers || {};
      config.headers["Content-Type"] = "text/plain";
      return config;
    });
  }

  // function setupResponseInterceptor() {
  //   http.addResponseInterceptor(async response => {
  //     // 可以在这里处理响应数据
  //     console.log("Response received:", response.status);
  //     return response;
  //   });
  // }
  return http;
}

const http = initializeHttp();

interface KWResponse<T> {
  code: number;
  data: T;
}

export interface KWSong {
  rid: string;
  name: string; // 歌曲名称
  artist: string;
  pic: string; // 封面
  lrc: string; // 歌词链接
  url: string; // 歌曲链接
}

export async function getSongs(params: Record<string, string>) {
  const response = await http.get<KWResponse<KWSong[]>>("", {
    params,
  });
  return response.data;
}

export async function getUserById(id: string) {
  const response = await http.get(`/${id}`);
  return response.data;
}

export async function createUser(userData: any) {
  const response = await http.post("", userData);
  return response.data;
}

export async function updateUser(id: string, userData: any) {
  const response = await http.put(`/${id}`, userData);
  return response.data;
}

export async function deleteUser(id: string) {
  await http.delete(`/${id}`);
}
