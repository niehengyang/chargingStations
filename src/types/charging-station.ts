// 充电站状态类型
export type ChargingStationStatus = "运营中" | "维护中" | "暂停服务" | "建设中";

// 充电站类型
export type ChargingStationType = "电动汽车" | "电动自行车";

// 充电站接口
export interface ChargingStation {
    id: string;
    name: string;
    stationType: ChargingStationType;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    address: string;
    province: string;
    city: string;
    district: string;
    chargingUnits: {
        totalCount: number;
        groupCount: number;
        unitsPerGroup: number;
        availableCount: number;
        chargingCount: number;
        maintenanceCount: number;
    };
    chargingTypes: string[];
    powerRatings: string[];
    owner: string;
    operator: string;
    contactPhone: string;
    operatingHours: string;
    description: string;
    amenities: string[];
    paymentMethods: string[];
    status: ChargingStationStatus;
    lastMaintenance: string;
    nextMaintenance: string;
}

// 提示框位置类型
export type TooltipPosition = "tooltip-bottom" | "tooltip-top";

export interface Photo {
    id: string;
    filename: string;
    path: string;
    description: string;
    uploadTime: string;
    size: number;
}

// 电池柜数据类型定义
export interface BatteryCabinet {
    cabinetId: string;
    supplier: string;
    batteryCount: number;
    batteryType: string;
    capacity: string;
    status: string;
}

// 基本信息类型定义
export interface BasicInfo {
    owner: string;
    operator: string;
    contactPhone: string;
    establishmentDate: string;
}

// 换电站数据类型定义
export interface BatterySwapStation {
    id: string;
    name: string;
    stationType: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    address: string;
    province: string;
    city: string;
    district: string;
    status: string;
    serviceRadius: number; // 服务辐射范围（公里）
    basicInfo: BasicInfo;
    photos: Photo[];
    batteryCabinets: BatteryCabinet[];
    description: string;
}

export interface BatterySwapStationData {
    batterySwapStations: BatterySwapStation[];
    metadata: {
        totalStations: number;
        totalBatteryCabinets: number;
        totalAvailableCabinets: number;
        totalInUseCabinets: number;
        totalMaintenanceCabinets: number;
        lastUpdated: string;
        version: string;
        dataSource: string;
        coverage: {
            districts: string[];
            majorAreas: string[];
            stationTypes: Record<string, number>;
        };
    };
}

// 服务器API响应类型
export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}