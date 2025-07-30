// 环境配置管理
export const ENV_CONFIG = {
    // API 服务配置
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
    API_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",

    // 服务器配置
    SERVER_PORT: import.meta.env.VITE_SERVER_PORT || 3001,
    SERVER_HOST: import.meta.env.VITE_SERVER_HOST || "localhost",

    // 开发环境配置
    NODE_ENV: import.meta.env.VITE_NODE_ENV || "development",

    // 数据文件路径
    DATA_FILE_PATH: import.meta.env.VITE_DATA_FILE_PATH || "src/apis/battery-swap-station-data.json",

    // Web 应用配置
    APP_TITLE: import.meta.env.VITE_APP_TITLE || "充电站导航系统",
    APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || "智能充电站导航和查询系统",
    APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",

    // 高德地图配置
    AMAP_KEY: import.meta.env.VITE_AMAP_KEY || "",
    AMAP_SECURITY_JS_CODE: import.meta.env.VITE_AMAP_SECURITY_JS_CODE || "",

    // HTTPS 配置
    HTTPS_ENABLED: import.meta.env.VITE_HTTPS_ENABLED === "true" || false,
    HTTPS_KEY_PATH: import.meta.env.VITE_HTTPS_KEY_PATH || "certificates/localhost-key.pem",
    HTTPS_CERT_PATH: import.meta.env.VITE_HTTPS_CERT_PATH || "certificates/localhost-cert.pem",

    // 代理配置
    PROXY_ENABLED: import.meta.env.VITE_PROXY_ENABLED === "true" || true,
    PROXY_TARGET: import.meta.env.VITE_PROXY_TARGET || "http://localhost:3001",

    // 构建配置
    BUILD_OUTPUT_DIR: import.meta.env.VITE_BUILD_OUTPUT_DIR || "dist",
    BUILD_SOURCEMAP: import.meta.env.VITE_BUILD_SOURCEMAP === "true" || true,

    // 缓存配置
    CACHE_ENABLED: import.meta.env.VITE_CACHE_ENABLED === "true" || true,
    CACHE_MAX_AGE: parseInt(import.meta.env.VITE_CACHE_MAX_AGE || "3600"),

    // 调试配置
    DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === "true" || false,
    LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || "debug",

    // 是否开发环境
    IS_DEV: import.meta.env.DEV || false,

    // 是否生产环境
    IS_PROD: import.meta.env.PROD || false
};

// 获取完整的 API URL
export const getApiUrl = (endpoint: string): string => {
    const baseUrl = ENV_CONFIG.API_BASE_URL.replace(/\/$/, ""); // 移除末尾的斜杠
    const cleanEndpoint = endpoint.replace(/^\//, ""); // 移除开头的斜杠
    return `${baseUrl}/${cleanEndpoint}`;
};

// 检查环境配置
export const validateEnvConfig = (): boolean => {
    const requiredConfigs = ["API_BASE_URL", "SERVER_PORT", "SERVER_HOST"];

    for (const config of requiredConfigs) {
        if (!ENV_CONFIG[config as keyof typeof ENV_CONFIG]) {
            console.error(`缺少必要的环境配置: ${config}`);
            return false;
        }
    }

    return true;
};

// 验证高德地图配置
export const validateAmapConfig = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!ENV_CONFIG.AMAP_KEY) {
        errors.push("缺少高德地图 API 密钥 (VITE_AMAP_KEY)");
    }

    if (!ENV_CONFIG.AMAP_SECURITY_JS_CODE) {
        errors.push("缺少高德地图安全 JS 代码 (VITE_AMAP_SECURITY_JS_CODE)");
    }

    // 验证密钥格式（基本格式检查）
    if (ENV_CONFIG.AMAP_KEY && ENV_CONFIG.AMAP_KEY.length < 10) {
        errors.push("高德地图 API 密钥格式不正确");
    }

    if (ENV_CONFIG.AMAP_SECURITY_JS_CODE && ENV_CONFIG.AMAP_SECURITY_JS_CODE.length < 10) {
        errors.push("高德地图安全 JS 代码格式不正确");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// 获取高德地图配置信息
export const getAmapConfigInfo = () => {
    const validation = validateAmapConfig();

    return {
        key: ENV_CONFIG.AMAP_KEY,
        securityJsCode: ENV_CONFIG.AMAP_SECURITY_JS_CODE,
        isConfigured: ENV_CONFIG.AMAP_KEY && ENV_CONFIG.AMAP_SECURITY_JS_CODE,
        validation
    };
};

// 开发环境配置
export const DEV_CONFIG = {
    API_TIMEOUT: 10000, // 10秒超时
    RETRY_COUNT: 3, // 重试次数
    DEBUG_MODE: ENV_CONFIG.IS_DEV
};

// 生产环境配置
export const PROD_CONFIG = {
    API_TIMEOUT: 5000, // 5秒超时
    RETRY_COUNT: 1, // 重试次数
    DEBUG_MODE: false
};

// 根据环境获取配置
export const getConfig = () => {
    return ENV_CONFIG.IS_DEV ? DEV_CONFIG : PROD_CONFIG;
};
