
import { request } from "../../request";
import type { BatterySwapStation, BatterySwapStationData, ApiResponse } from "../../types/charging-station";

// API 端点
const API_ENDPOINTS = {
    STATIONS: "/station",
    STATION_BY_ID: (id: string) => `/station/${id}`,
    STATION_PHOTOS: (id: string) => `/station/${id}/photos`,
    STATION_PHOTO_BY_ID: (stationId: string, photoId: string) => `/station/${stationId}/photos/${photoId}`,
    HEALTH: "/station/health"
};

// 健康检查
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
    try {
        const response = await request.get(API_ENDPOINTS.HEALTH);
        return response;
    } catch (error) {
        console.error("健康检查失败:", error);
        throw error;
    }
};

// 检查服务器连接
export const checkServerConnection = async (): Promise<boolean> => {
    try {
        await healthCheck();
        return true;
    } catch (error) {
        console.error("服务器连接检查失败:", error);
        return false;
    }
};

// 获取所有换电站
export const getAllStations = async (): Promise<ApiResponse<BatterySwapStation[]>> => {
    try {
        if (import.meta.env.VITE_DEBUG_MODE === "true") {
            console.log(`[API] 获取所有换电站数据`);
        }

        const response = await request.get<ApiResponse<BatterySwapStation[]>>(API_ENDPOINTS.STATIONS);
        return response;
    } catch (error) {
        console.error("获取换电站数据失败:", error);
        throw error;
    }
};

// 根据ID获取换电站
export const getStationById = async (id: string): Promise<BatterySwapStation> => {
    try {
        const response = await request.get<{status: number, message: string, data: BatterySwapStation}>(API_ENDPOINTS.STATION_BY_ID(id));
        return response.data;
    } catch (error) {
        throw new Error(`获取换电站失败: ${error}`);
    }
};

// 创建新换电站
export const createStation = async (stationData: Omit<BatterySwapStation, "id">): Promise<BatterySwapStation> => {
    try {
        if (import.meta.env.VITE_DEBUG_MODE === "true") {
            console.log(`[API] 创建新换电站:`, stationData.name);
        }

        const response = await request.post<{status: number, message: string, data: BatterySwapStation}>(API_ENDPOINTS.STATIONS, stationData);
        return response.data;
    } catch (error) {
        console.error("创建换电站失败:", error);
        throw error;
    }
};

// 更新换电站
export const updateStation = async (id: string, updates: Partial<BatterySwapStation>): Promise<BatterySwapStation> => {
    try {
        if (import.meta.env.VITE_DEBUG_MODE === "true") {
            console.log(`[API] 更新换电站: ${id}`);
        }

        const response = await request.put<{status: number, message: string, data: BatterySwapStation}>(API_ENDPOINTS.STATION_BY_ID(id), updates);
        return response.data;
    } catch (error) {
        console.error(`更新换电站 ${id} 失败:`, error);
        throw error;
    }
};

// 删除换电站
export const deleteStation = async (id: string): Promise<{ success: boolean; message?: string; deletedPhotos?: number }> => {
    try {
        if (import.meta.env.VITE_DEBUG_MODE === "true") {
            console.log(`[API] 删除换电站: ${id}`);
        }

        const response = await request.delete<{
            success: boolean;
            message?: string;
            deletedPhotos?: number;
        }>(API_ENDPOINTS.STATION_BY_ID(id));
        return response;
    } catch (error) {
        console.error(`删除换电站 ${id} 失败:`, error);
        throw error;
    }
};

// 添加照片到换电站
export const addPhotoToStation = async (
    stationId: string,
    photoData: {
        id: string;
        filename: string;
        path: string;
        description: string;
        uploadTime: string;
        size: number;
        base64Data: string;
    }
): Promise<any> => {
    try {
        if (import.meta.env.VITE_DEBUG_MODE === "true") {
            console.log(`[API] 添加照片到换电站: ${stationId}, 文件名: ${photoData.filename}`);
        }

        const response = await request.post(API_ENDPOINTS.STATION_PHOTOS(stationId), photoData);
        return response;
    } catch (error) {
        console.error(`添加照片到换电站 ${stationId} 失败:`, error);
        throw error;
    }
};

// 删除换电站照片
export const deletePhotoFromStation = async (stationId: string, photoId: string): Promise<any> => {
    try {
        if (import.meta.env.VITE_DEBUG_MODE === "true") {
            console.log(`[API] 删除换电站照片: ${stationId}, 照片ID: ${photoId}`);
        }

        const response = await request.delete(API_ENDPOINTS.STATION_PHOTO_BY_ID(stationId, photoId));
        return response;
    } catch (error) {
        console.error(`删除换电站照片 ${stationId}/${photoId} 失败:`, error);
        throw error;
    }
};

// API 服务类
export class StationApiService {
    private static instance: StationApiService;

    private constructor() {}

    public static getInstance(): StationApiService {
        if (!StationApiService.instance) {
            StationApiService.instance = new StationApiService();
        }
        return StationApiService.instance;
    }

    // 获取服务器状态
    public async getServerStatus(): Promise<{ isOnline: boolean; responseTime: number }> {
        const startTime = Date.now();
        try {
            await healthCheck();
            const responseTime = Date.now() - startTime;
            return { isOnline: true, responseTime };
        } catch (error) {
            return { isOnline: false, responseTime: 0 };
        }
    }

    // 获取所有换电站（带缓存）
    public async getAllStationsWithCache(): Promise<ApiResponse<BatterySwapStation[]>> {
        const cacheKey = "stations_cache";
        const cacheMaxAge = Number(import.meta.env.VITE_CACHE_MAX_AGE) * 1000; // 转换为毫秒

        if (import.meta.env.VITE_CACHE_ENABLED === "true") {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const age = Date.now() - timestamp;
                if (age < cacheMaxAge) {
                    if (import.meta.env.VITE_DEBUG_MODE === "true") {
                        console.log(`[Cache] 使用缓存的换电站数据 (${age}ms old)`);
                    }
                    return data;
                }
            }
        }

        const data = await getAllStations();

        if (import.meta.env.VITE_CACHE_ENABLED === "true") {
            localStorage.setItem(
                cacheKey,
                JSON.stringify({
                    data,
                    timestamp: Date.now()
                })
            );
            if (import.meta.env.VITE_DEBUG_MODE === "true") {
                console.log(`[Cache] 缓存换电站数据`);
            }
        }

        return data;
    }

    // 批量操作
    public async batchGetStations(ids: string[]): Promise<(BatterySwapStation | null)[]> {
        const promises = ids.map((id) => getStationById(id));
        return Promise.all(promises);
    }

    // 搜索换电站
    public async searchStations(query: string): Promise<BatterySwapStation[]> {
        const response = await this.getAllStationsWithCache();
        const searchTerm = query.toLowerCase();

        if (response.status === 0 && response.data) {
            return response.data.filter(
                (station) =>
                    station.name.toLowerCase().includes(searchTerm) ||
                    station.address.toLowerCase().includes(searchTerm) ||
                    station.description.toLowerCase().includes(searchTerm)
            );
        }
        return [];
    }
}

// 导出单例实例
export const stationApiService = StationApiService.getInstance();
