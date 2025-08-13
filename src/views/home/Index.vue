<!-- @vue-ignore linter false positive: <script setup> variables are auto-exposed -->
<template>
    <div class="map-page-container">
        <!-- 路线规划面板 -->
        <div v-if="showRoutePlanner" class="route-planner-panel">
            <RoutePlanner :map="map" @close="showRoutePlanner = false" />
        </div>
        <!-- 地图组件 -->
        <el-amap 
            :features="['bg','road','building','point']"
            :viewMode="'2D'"
            :optimize-zoom="true"
            :dragEnable="true"
            :zoomEnable="true"
            :doubleClickZoom="false"
            :zoom="zoom" 
            :center="center" 
            :map-style="currentMapStyle"
            :animateEnable="false"
            :resizeEnable="true"
            :rotateEnable="false"
            :pitchEnable="false"
            :scrollWheel="true"
            :touchZoom="true"
            :keyboardEnable="false"
            @init="onInit"
            class="map-container"
        >
        <!-- 地图搜索组件 -->
        <MapSearch 
            :map-instance="map"
            @location-selected="handleSearchLocationSelected"
            @search-clear="handleSearchClear"
        />
            
            <!-- 服务辐射范围圆圈 -->
            <el-amap-circle
                v-for="(marker, index) in visibleCircleMarkers"
                :key="`circle-${index}`"
                :center="marker.position"
                :radius="marker.serviceRadius * 1000"
                :stroke-color="markerInfoRef?.getCircleStrokeColor(marker.status)"
                :stroke-weight="2"
                :stroke-opacity="1.0"
                :fill-color="markerInfoRef?.getCircleFillColor(marker.status)"
                :fill-opacity="0.05"
                :stroke-style="markerInfoRef?.getCircleStrokeStyle(marker.status)"
            />
            <!-- 站点标记 -->
            <el-amap-marker
                v-for="(marker, index) in markers"
                :key="`marker-${index}`"
                :position="marker.position"
            >
                <!-- 自定义标记组件 -->
                <CustomMarker 
                    :marker="marker as any" 
                    @click="clickArrayMarker"
                />
            </el-amap-marker>

            
            <!-- 站点信息弹窗 -->
            <MarkerInfo ref="markerInfoRef" @service-radius-toggle="handleServiceRadiusToggle" />
        </el-amap>

      
        <!-- 地图样式选择器 -->
        <MapStyleSelector v-if="showMapStyleSelector" @style-change="handleStyleChange" @close="showMapStyleSelector = false" />
        
        <!-- 圆形菜单组件，固定在右下角，传递ref -->
        <CircleMenu class="circle-menu-fixed" ref="circleMenuRef" @menu-click="handleMenuClick" />
        <!-- StationCreator 组件实例 -->
        <StationCreator v-model="showStationCreator" ref="stationCreatorRef" @station-created="handleStationCreated" />

    </div>
    
</template>

<script setup lang="ts">
import { ref, type Ref, computed, onMounted, onUnmounted } from "vue";
import MarkerInfo from "@/components/MarkerInfo.vue";
import MapStyleSelector from "@/components/MapStyleSelector.vue";
import CustomMarker from "@/components/CustomMarker.vue";
import MapSearch from "@/components/MapSearch.vue";
import RoutePlanner from "@/components/RoutePlanner.vue";
import { getAllStations } from "@/utils/api/station-api";
import CircleMenu from '@/components/CircleMenu.vue'; // 引入 CircleMenu 组件
import StationCreator from '@/components/StationCreator.vue'; // 引入 StationCreator 组件


// 引入图标字体
import "../../assets/iconfonts/iconfont.css";
import router from "@/router";

// 防抖函数
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 节流函数
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function executedFunction(...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 控制圆圈显示的状态
const visibleCircles = ref<Set<string>>(new Set())

// 计算可见的圆圈标记
const visibleCircleMarkers = computed(() => {
  return markers.value.filter(marker => visibleCircles.value.has(marker.id))
})

// 从地址中提取省市区信息
const extractAddressComponent = (address: string, type: 'province' | 'city' | 'district'): string => {
  // 简单的地址解析正则表达式，实际应用中可能需要更复杂的解析
  let result = '未知';
  
  if (type === 'province') {
    const provinceMatch = address.match(/(.*?省|.*?自治区)/);
    if (provinceMatch) result = provinceMatch[1];
  } else if (type === 'city') {
    const cityMatch = address.match(/(.*?市|.*?自治州|.*?地区)/);
    if (cityMatch) result = cityMatch[1];
  } else if (type === 'district') {
    const districtMatch = address.match(/(.*?区|.*?县|.*?镇)/);
    if (districtMatch) result = districtMatch[1];
  }
  
  return result;
}



// 定义地图标记类型 - 基于 battery-swap-station-data.json 结构
interface MapMarker {
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
    basicInfo: {
        owner: string;
        operator: string;
        contactPhone: string;
        operatingHours: string;
        establishmentDate?: string;
    };
    operationStatus: {
        totalBatteryCabinets: number;
        availableCabinets: number;
        inUseCabinets: number;
        maintenanceCabinets: number;
        dailySwapCount: number;
        averageSwapTime: string;
    };
    batteryCabinets: Array<{
        cabinetId: string;
        supplier: string;
        batteryCount: number;
        batteryType: string;
        capacity: string;
        status: string;
    }>;
    description: string;
    photos: any[];
    position: [number, number];
}

// 定义地图实例类型
interface AMapInstance {
    setMapStyle: (styleUrl: string) => void;
    setZoomAndCenter: (zoom: number, center: [number, number]) => void;
    addControl: (control: any) => void;
    plugin: (plugins: string[], callback: () => void) => void;
}

// 定义 MarkerInfo 组件实例类型
interface MarkerInfoInstance {
    openDialog: (marker: MapMarker) => void;
}

const zoom: Ref<number> = ref(12);
const center: Ref<[number, number]> = ref([102.716148, 25.000609]);

// 地图样式相关
const currentMapStyle: Ref<string> = ref('amap://styles/normal');

const map: Ref<AMapInstance | null> = ref(null);

// 处理地图样式变化
const handleStyleChange = (styleUrl: string): void => {
  currentMapStyle.value = styleUrl;
  
  // 如果地图已经初始化，直接设置样式
  if (map.value) {
    map.value.setMapStyle(styleUrl);
  }
};

// 缩放事件处理器
let zoomEventListeners: any[] = [];

const onInit = (e: AMapInstance): void => {
  e.plugin(['AMap.ToolBar'], () => {
    const toolBar = new (window as any).AMap.ToolBar({
      position: 'RB'
    });
    e.addControl(toolBar);
  });
  
  // 添加缩放事件的防抖处理
  const debouncedZoomHandler = debounce(() => {
    // 缩放结束后的处理逻辑
  }, 300);
  
  // 添加缩放开始事件的节流处理
  const throttledZoomStartHandler = throttle(() => {
    // 缩放开始时的处理逻辑
  }, 100);
  
  // 监听缩放事件
  const zoomStartListener = e.on('zoomstart', throttledZoomStartHandler);
  const zoomEndListener = e.on('zoomend', debouncedZoomHandler);
  
  // 保存事件监听器引用，用于清理
  zoomEventListeners = [zoomStartListener, zoomEndListener];
  
  map.value = e;
}

// 站点数据
const markers: Ref<MapMarker[]> = ref([]);

// 加载站点数据
const loadStations = async () => {
  try {
    const response = await getAllStations();
    if (response.status === 0 && response.data) {
      markers.value = response.data.map((station: any): MapMarker => {
        // 计算电池柜统计信息
        const batteryCabinets = station.batteryCabinets || [];
        const totalBatteryCabinets = batteryCabinets.length;
        const availableCabinets = batteryCabinets.filter((cabinet: any) => cabinet.status === '可用').length;
        const inUseCabinets = batteryCabinets.filter((cabinet: any) => cabinet.status === '使用中').length;
        const maintenanceCabinets = batteryCabinets.filter((cabinet: any) => cabinet.status === '维护中').length;
        
        return {
          position: [
            station.coordinates.longitude,
            station.coordinates.latitude
          ],
          id: station.id,
          name: station.name,
          stationType: station.stationType,
          coordinates: station.coordinates,
          address: station.address,
          status: station.status,
          serviceRadius: station.serviceRadius || 3.0, // 默认3公里
          basicInfo: {
            owner: station.basicInfo.owner,
            operator: station.basicInfo.operator,
            contactPhone: station.basicInfo.contactPhone,
            operatingHours: station.basicInfo.operatingHours || '24小时',
            establishmentDate: station.basicInfo.establishmentDate
          },
          operationStatus: station.operationStatus || {
            totalBatteryCabinets,
            availableCabinets,
            inUseCabinets,
            maintenanceCabinets,
            dailySwapCount: station.operationStatus?.dailySwapCount || 0,
            averageSwapTime: station.operationStatus?.averageSwapTime || '5分钟'
          },
          batteryCabinets,
          description: station.description,
          photos: station.photos || [],
          // 优先使用数据中的省市区信息，如果没有则从地址中提取
          province: station.province || extractAddressComponent(station.address, 'province'),
          city: station.city || extractAddressComponent(station.address, 'city'),
          district: station.district || extractAddressComponent(station.address, 'district')
        };
      });
    }
  } catch (error) {
    console.error('加载站点数据失败:', error);
    // 可以在这里添加错误提示
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadStations();
});

// 组件卸载时清理事件监听器
onUnmounted(() => {
  // 清理缩放事件监听器
  if (zoomEventListeners.length > 0) {
    zoomEventListeners.forEach(listener => {
      if (listener && typeof listener.off === 'function') {
        listener.off();
      }
    });
    zoomEventListeners = [];
  }
  
  // 清理地图实例
  if (map.value) {
    map.value = null;
  }
});

const markerInfoRef: Ref<MarkerInfoInstance | null> = ref(null);
const stationCreatorRef = ref();


const clickArrayMarker = (marker: any): void => {
  const mapMarker = marker as MapMarker;
  markerInfoRef.value?.openDialog(mapMarker);
}

// 处理搜索位置选择事件
const handleSearchLocationSelected = (location: [number, number], name: string): void => {
  // 更新地图中心
  center.value = location;
};

// 处理搜索清除事件
const handleSearchClear = (): void => {
  // 搜索标记已清除
};

// 添加响应式变量控制创建对话框显示
const showStationCreator = ref(false);
// 添加响应式变量控制路线规划面板显示
const showRoutePlanner = ref(false);
// 添加响应式变量控制地图样式选择器显示
const showMapStyleSelector = ref(false);



// 处理站点创建事件
const handleStationCreated = (newStation: any): void => {
  // 重新加载站点数据以确保数据同步
  loadStations();
};

// 处理站点更新事件
const handleStationUpdated = (updatedStation: any): void => {
  // 重新加载站点数据以确保数据同步
  loadStations();
};

// 处理服务半径开关切换
const handleServiceRadiusToggle = (enabled: boolean, markerId: string) => {
  if (enabled) {
    visibleCircles.value.add(markerId)
  } else {
    visibleCircles.value.delete(markerId)
  }
}

const handleMenuClick = (action: string) => {
  if (action === '创建站点') {
    showStationCreator.value = true;
  } else if (action === '列表管理') {
    // 跳转到列表页面
    router.push('/list');
  } else if (action === '主题设置') {
    // 切换地图样式选择器显示状态
    showMapStyleSelector.value = !showMapStyleSelector.value;
  } else if (action === '线路规划') {
    // 切换路线规划面板显示状态
    showRoutePlanner.value = !showRoutePlanner.value;
  }
}
</script>

<style lang="scss" scoped>
/* 重置默认样式，确保页面撑满屏幕 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

/* 确保根元素撑满屏幕 */
#app {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.map-page-container {
    width: 100vw;
    height: 100vh;
    background-color: #f6f7fb;
    position: relative;
    overflow: hidden;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
}

.map-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    flex: 1;
}

// 优化组件层级管理，确保不会相互影响
:deep(.sidebar-container) {
    z-index: 2000;
    position: relative;
}

:deep(.map-style-selector) {
    z-index: 1500;
    position: fixed !important;
}

:deep(.station-creator) {
    z-index: 1500;
    position: relative;
}

// 确保地图搜索组件在地图上方但低于其他UI组件
:deep(.el-amap-search-box) {
    z-index: 1000 !important;
}

/* 保证弹窗始终居中且不超出屏幕 */
.marker-info-dialog :deep(.el-dialog) {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  max-width: 90vw !important;
  width: 80vw !important;
  min-width: 320px;
  max-height: 90vh !important;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* 弹窗内容区域滚动 */
.marker-info-dialog :deep(.el-dialog__body) {
  flex: 1 1 auto;
  max-height: calc(90vh - 60px); /* 60px 预留header/footer */
  overflow-y: auto;
  padding: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .marker-info-dialog :deep(.el-dialog) {
    width: 98vw !important;
    max-width: 98vw !important;
    min-width: unset;
    max-height: 98vh !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
  }
  .marker-info-dialog :deep(.el-dialog__body) {
    max-height: calc(98vh - 60px);
  }
}

// 确保抽屉组件在最顶层
:deep(.el-drawer) {
    z-index: 2500 !important;
}

// 确保对话框在最顶层
:deep(.el-dialog) {
    z-index: 4000 !important;
}

// 确保消息提示在最顶层
:deep(.el-message) {
    z-index: 3500 !important;
}

// 确保通知在最顶层
:deep(.el-notification) {
    z-index: 3500 !important;
}

/* 路线规划相关样式 */
.route-planner-panel {
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: fit-content;
    z-index: 2000;
    display: flex;
    align-items: center;
    background: rgba(255,255,255,0.95);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    padding: 10px 18px;
    gap: 8px;
}
.route-select {
    min-width: 180px;
}

.circle-menu-fixed {
  position: fixed;
  right: 120px;
  bottom: 86px;
  z-index: 3000;
  pointer-events: auto;
}
</style>
