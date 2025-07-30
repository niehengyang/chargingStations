<template>
  <div class="map-picker">
    <!-- 地图容器 -->
    <el-amap 
      ref="mapRef"
      :zoom="zoom" 
      :center="center" 
      :map-style="mapStyle"
      @init="onMapInit"
      @click="onMapClick"
      class="map-container"
      :style="mapContainerStyle"
    >
      
      <!-- 标记点 -->
      <el-amap-marker
        v-if="selectedMarker"
        :position="selectedMarker"
        :offset="[0, -30]"
        @click="onMarkerClick"
      >
        <div class="custom-marker">
          <div class="marker-icon">
            <el-icon><Location /></el-icon>
          </div>
          <div class="marker-label">已选择位置</div>
          <div class="marker-coords">
            {{ formatCoordinates(selectedMarker) }}
          </div>
        </div>
      </el-amap-marker>
      
      <!-- 选择提示 -->
      <div v-if="!selectedMarker" class="map-hint">
        <div class="hint-content">
          <el-icon><MapLocation /></el-icon>
          <span>点击地图选择位置</span>
        </div>
      </div>
    </el-amap>
    
    <!-- 坐标显示 -->
    <div v-if="selectedMarker" class="coordinates-display">
      <div class="coord-item">
        <span class="coord-label">经度:</span>
        <span class="coord-value">{{ selectedMarker[0].toFixed(6) }}</span>
      </div>
      <div class="coord-item">
        <span class="coord-label">纬度:</span>
        <span class="coord-value">{{ selectedMarker[1].toFixed(6) }}</span>
      </div>
      <el-button 
        type="primary" 
        size="small" 
        @click="clearMarker"
        class="clear-btn"
      >
        清除标记
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Location, MapLocation } from '@element-plus/icons-vue'

// 定义事件类型
interface Coordinates {
  longitude: number
  latitude: number
}

// Props
interface Props {
  modelValue?: Coordinates | null
  height?: string
  zoom?: number
  center?: [number, number]
  mapStyle?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  height: '300px',
  zoom: 12,
  center: () => [102.716148, 25.000609], // 昆明市中心
  mapStyle: 'amap://styles/normal',
  readonly: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [coordinates: Coordinates | null]
  'marker-selected': [coordinates: Coordinates]
  'marker-cleared': []
}>()

// 响应式数据
const mapRef = ref()
const mapInstance = ref<any>(null)
const selectedMarker = ref<[number, number] | null>(null)

// 计算属性
const mapContainerStyle = computed(() => ({
  height: props.height
}))

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedMarker.value = [newValue.longitude, newValue.latitude]
  } else {
    selectedMarker.value = null
  }
}, { immediate: true })

// 地图初始化
const onMapInit = (map: any) => {
  mapInstance.value = map
  console.log('地图选择器初始化完成')
  
  // 添加工具栏插件
  map.plugin(['AMap.ToolBar'], () => {
    const toolBar = new (window as any).AMap.ToolBar({
      position: 'RB'
    });
    map.addControl(toolBar);
  });
  
  // 如果有初始值，设置标记
  if (props.modelValue) {
    selectedMarker.value = [props.modelValue.longitude, props.modelValue.latitude]
  }
}

// 地图点击事件
const onMapClick = (e: any) => {
  if (props.readonly) return
  
  const { lng, lat } = e.lnglat
  const coordinates: Coordinates = {
    longitude: lng,
    latitude: lat
  }
  
  // 设置标记
  selectedMarker.value = [lng, lat]
  
  // 触发事件
  emit('update:modelValue', coordinates)
  emit('marker-selected', coordinates)
  
  ElMessage.success('位置已选择')
}

// 标记点击事件
const onMarkerClick = () => {
  if (props.readonly) return
  
  ElMessage.info('点击地图其他位置可重新选择')
}

// 清除标记
const clearMarker = () => {
  selectedMarker.value = null
  emit('update:modelValue', null)
  emit('marker-cleared')
  ElMessage.info('标记已清除')
}

// 格式化坐标显示
const formatCoordinates = (coords: [number, number]) => {
  return `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
}

// 暴露方法给父组件
defineExpose({
  clearMarker,
  setMarker: (coordinates: Coordinates) => {
    selectedMarker.value = [coordinates.longitude, coordinates.latitude]
    emit('update:modelValue', coordinates)
  },
  getMarker: () => {
    if (!selectedMarker.value) return null
    return {
      longitude: selectedMarker.value[0],
      latitude: selectedMarker.value[1]
    }
  }
})
</script>

<style lang="scss" scoped>
.map-picker {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  
  .map-container {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  .map-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    pointer-events: none;
    
    .hint-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      color: #606266;
      font-size: 14px;
      
      .el-icon {
        font-size: 24px;
        color: #409eff;
      }
    }
  }
  
  .custom-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: markerPulse 2s infinite;
    
    .marker-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #409eff, #67c23a);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
      border: 3px solid white;
    }
    
    .marker-label {
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-top: 4px;
      white-space: nowrap;
    }
    
    .marker-coords {
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
  }
  
  .coordinates-display {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 200px;
    
    .coord-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 12px;
      }
      
      .coord-label {
        font-size: 12px;
        color: #606266;
        font-weight: 500;
      }
      
      .coord-value {
        font-size: 12px;
        color: #303133;
        font-family: 'Courier New', monospace;
        background: #f5f7fa;
        padding: 2px 6px;
        border-radius: 3px;
      }
    }
    
    .clear-btn {
      width: 100%;
      font-size: 12px;
      height: 28px;
    }
  }
}

@keyframes markerPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .map-picker {
    .coordinates-display {
      position: relative;
      top: auto;
      right: auto;
      margin-top: 10px;
      border-radius: 0;
      box-shadow: none;
      border-top: 1px solid #ebeef5;
    }
  }
}
</style> 