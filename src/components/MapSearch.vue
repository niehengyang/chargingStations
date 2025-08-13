<template>
    <!-- 地图搜索框 -->
    <el-amap-search-box
        :visible="true"
        :debounce="1000"
        :placeholder="'请输入地址搜索'"
        @select="handleSearchSelect"
        @choose="handleSearchChoose"
        @search="handleSearch"
    >
    </el-amap-search-box>
    
    <!-- 搜索位置区域圆圈 -->
    <el-amap-circle
        v-if="searchMarker"
        :center="searchMarker"
        :radius="500"
        stroke-color="#1890ff"
        :stroke-weight="3"
        :stroke-opacity="0.8"
        fill-color="#1890ff"
        :fill-opacity="0.1"
        stroke-style="dashed"
    />
    
    <!-- 搜索位置标记 -->
    <el-amap-marker
        v-if="searchMarker"
        :position="searchMarker"
        :offset="[0, -30]"
        @click="clearSearchMarker"
    >
        <div class="search-marker">
            <div class="search-marker-icon">
                <el-icon><Location /></el-icon>
            </div>
            <div class="search-marker-label">{{ searchMarkerName }}</div>
            <div class="search-marker-info">{{ searchMarkerInfo }}</div>
            <div class="search-marker-hint">点击清除</div>
        </div>
    </el-amap-marker>
</template>

<script setup lang="ts">
import { ref, type Ref } from "vue";
import { Search, Location } from '@element-plus/icons-vue';

// 定义事件类型
interface SearchLocation {
    location: [number, number];
    name: string;
}

// 定义地图实例类型
interface AMapInstance {
    setMapStyle: (styleUrl: string) => void;
    setZoomAndCenter: (zoom: number, center: [number, number]) => void;
    addControl: (control: any) => void;
    plugin: (plugins: string[], callback: () => void) => void;
}

// Props
interface Props {
    mapInstance?: AMapInstance | null;
}

const props = withDefaults(defineProps<Props>(), {
    mapInstance: null
});

// Emits
const emit = defineEmits<{
    'location-selected': [location: [number, number], name: string];
    'search-clear': [];
}>();

// 搜索位置标记相关
const searchMarker: Ref<[number, number] | null> = ref(null);
const searchMarkerName: Ref<string> = ref('');
const searchMarkerInfo: Ref<string> = ref('');

// 清除搜索标记
const clearSearchMarker = (): void => {
    searchMarker.value = null;
    searchMarkerName.value = '';
    searchMarkerInfo.value = '';
    emit('search-clear');
};

// 处理搜索位置选择
const handleLocationSelect = (location: [number, number], name: string): void => {
    // 将地图中心移动到选中的位置
    if (props.mapInstance) {
        props.mapInstance.setZoomAndCenter(15, location);
    }
    
    // 清除之前的搜索标记
    clearSearchMarker();
    
    // 设置新的搜索位置标记
    searchMarker.value = location;
    searchMarkerName.value = name;
    searchMarkerInfo.value = `经度: ${location[0].toFixed(6)}, 纬度: ${location[1].toFixed(6)}`;
    
    // 触发事件
    emit('location-selected', location, name);
    
    // 显示成功消息
    
    // 10秒后自动清除搜索标记
    setTimeout(() => {
        clearSearchMarker();
    }, 10000);
};

// 处理搜索选择事件
const handleSearchSelect = (e: any) => {
    
    // 尝试多种可能的数据结构
    let location: [number, number] | null = null;
    let name = '';
    
    if (e && e.location) {
        location = [e.location.lng, e.location.lat];
        name = e.name || e.address || '选中位置';
    } else if (e && e.poi) {
        location = [e.poi.location.lng, e.poi.location.lat];
        name = e.poi.name || e.poi.address || '选中位置';
    } else if (e && e.lng && e.lat) {
        location = [e.lng, e.lat];
        name = e.name || e.address || '选中位置';
    } else if (e && e.geometry && e.geometry.coordinates) {
        location = [e.geometry.coordinates[0], e.geometry.coordinates[1]];
        name = e.properties?.name || e.properties?.address || '选中位置';
    }
    
    if (location) {
        handleLocationSelect(location, name);
    } else {
        console.warn('无法解析搜索结果的位置信息:', e);
    }
};

// 处理搜索事件
const handleSearch = (e: any) => {
    // 搜索事件主要用于调试，实际的位置跳转由 select 和 choose 事件处理
};

// 处理搜索确认事件
const handleSearchChoose = (e: any) => {
    
    // 尝试多种可能的数据结构
    let location: [number, number] | null = null;
    let name = '';
    
    if (e && e.location) {
        location = [e.location.lng, e.location.lat];
        name = e.name || e.address || '选中位置';
    } else if (e && e.poi) {
        location = [e.poi.location.lng, e.poi.location.lat];
        name = e.poi.name || e.poi.address || '选中位置';
    } else if (e && e.lng && e.lat) {
        location = [e.lng, e.lat];
        name = e.name || e.address || '选中位置';
    } else if (e && e.geometry && e.geometry.coordinates) {
        location = [e.geometry.coordinates[0], e.geometry.coordinates[1]];
        name = e.properties?.name || e.properties?.address || '选中位置';
    }
    
    if (location) {
        handleLocationSelect(location, name);
    } else {
        console.warn('无法解析搜索结果的位置信息:', e);
    }
};

// 暴露方法给父组件
defineExpose({
    clearSearchMarker,
    handleLocationSelect
});
</script>

<style lang="scss" scoped>
/* 调整搜索框位置到顶部中间，避免与侧边栏按钮冲突 */
:deep(.el-amap-search-box) {
    position: absolute !important;
    top: 20px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    z-index: 1000 !important;
    width: 400px !important;
    max-width: calc(90vw - 100px) !important; /* 为侧边栏按钮留出空间 */
}

:deep(.el-amap-search-box .el-input) {
    background: white !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
    overflow: hidden !important;
}

:deep(.el-amap-search-box .el-input__wrapper) {
    border: none !important;
    box-shadow: none !important;
    height: 48px !important;
}

:deep(.el-amap-search-box .el-input__inner) {
    height: 48px !important;
    font-size: 14px !important;
    padding-left: 12px !important;
}

:deep(.el-amap-search-box .el-input__prefix) {
    margin-left: 12px !important;
}

.search-wrapper {
    width: 100%;
}

.search-input {
    :deep(.el-input__wrapper) {
        border: none;
        box-shadow: none;
    }
    
    :deep(.el-input__inner) {
        height: 48px;
        font-size: 14px;
    }
    
    :deep(.el-input__prefix) {
        margin-left: 12px;
    }
}

/* 搜索位置标记样式 */
.search-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: searchMarkerPulse 2s infinite;
}

.search-marker-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #1890ff, #52c41a);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
    border: 3px solid white;
}

.search-marker-label {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-top: 4px;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.search-marker-info {
    background: rgba(255, 255, 255, 0.9);
    color: #666;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    margin-top: 2px;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.search-marker-hint {
    background: rgba(255, 255, 255, 0.9);
    color: #666;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    margin-top: 2px;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.3s ease;
}

.search-marker-hint:hover {
    background: rgba(255, 255, 255, 1);
    color: #333;
}

@keyframes searchMarkerPulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.8;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>