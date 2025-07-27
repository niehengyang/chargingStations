import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 可以在这里添加认证token等逻辑
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 可以在这里统一处理响应数据
    return response.data;
  },
  (error: AxiosError) => {
    // 可以在这里统一处理错误
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

export default request;