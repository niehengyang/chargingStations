import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ENV_CONFIG } from "../config/env.ts";

class Request {
    private instance: AxiosInstance;

    constructor(config: AxiosRequestConfig) {
        this.instance = axios.create(config);

        this.instance.interceptors.request.use(
            (config) => {
                const token = window.localStorage.getItem("token") || "";
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // 添加调试信息
                if (ENV_CONFIG.DEBUG_MODE) {
                    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
                }

                return config;
            },
            (error) => {
                if (ENV_CONFIG.DEBUG_MODE) {
                    console.error("[API Request Error]", error);
                }
                return Promise.reject(error);
            }
        );

        this.instance.interceptors.response.use(
            (response) => {
                if (ENV_CONFIG.DEBUG_MODE) {
                    console.log(`[API Response] ${response.status} ${response.config.url}`);
                }
                return response;
            },
            (error) => {
                if (ENV_CONFIG.DEBUG_MODE) {
                    console.error("[API Response Error]", error);
                }
                return Promise.reject(error);
            }
        );
    }

    // 封装请求方法
    public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const res = await this.instance.get<T>(url, config);
        return res.data;
    }

    public async post<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
        const res = await this.instance.post<T, AxiosResponse<T, D>, D>(url, data, config);
        return res.data;
    }

    public async put<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
        const res = await this.instance.put<T, AxiosResponse<T, D>, D>(url, data, config);
        return res.data;
    }

    public async delete<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T> {
        const res = await this.instance.delete<T, AxiosResponse<T, D>, D>(url, config);
        return res.data;
    }

    public async request<T = any, D = any>(config: AxiosRequestConfig<D>): Promise<T> {
        const res = await this.instance.request<T, AxiosResponse<T, D>, D>(config);
        return res.data;
    }
}

// 使用环境配置创建请求实例
const request = new Request({
    baseURL: ENV_CONFIG.API_BASE_URL,
    timeout: ENV_CONFIG.IS_DEV ? 10000 : 5000, // 开发环境10秒，生产环境5秒
    headers: {
        "Content-Type": "application/json",
        "X-App-Version": ENV_CONFIG.APP_VERSION,
        "X-App-Name": encodeURIComponent(ENV_CONFIG.APP_TITLE) // 对中文字符进行URL编码
    }
});

export { request };
