<template>
  <div 
    class="custom-marker"
    :class="markerClass"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <!-- 换电站图标 -->
    <div class="marker-icon">
      <!-- 换电站图标 - 根据状态显示不同图标 -->
      <i class="iconfont" :class="getMarkerIcon()"></i>
    </div>
    
    <!-- 状态指示器 - 外围边框 -->
    <div class="status-indicator">
      <div class="status-ring"></div>
    </div>
    
    <!-- 悬停提示 -->
    <div class="tooltip" v-show="isHovered" :class="tooltipPosition">
      <div class="tooltip-content">
        <div class="tooltip-title">{{ marker.name }}</div>
        <div class="tooltip-status">
          <span class="status-text">{{ getStatusText(marker.status) }}</span>
          <span class="available-text">
            <template v-if="marker.serviceRadius">
              辐射范围: {{ marker.serviceRadius }} 公里
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义换电站标记类型
interface BatterySwapStation {
  id: string
  name: string
  stationType: string
  coordinates: {
    latitude: number
    longitude: number
  }
  address: string
  status: string
  basicInfo: {
    owner: string
    operator: string
    contactPhone: string
    establishmentDate?: string
  }
  batteryCabinets: Array<{
    cabinetId: string
    supplier: string
    batteryCount: number
    batteryType: string
    capacity: string
    status: string
  }>
  description: string
  photos: any[]
  position: [number, number]
  serviceRadius?: number
}

type TooltipPosition = 'tooltip-bottom' | 'tooltip-top'

// 定义Props和Emits
const props = defineProps<{
  marker: BatterySwapStation
  stationIcon?: string
  batteryIcon?: string
}>()

const emit = defineEmits<{
  click: [marker: BatterySwapStation]
}>()

// 响应式数据
const isHovered = ref<boolean>(false)
const tooltipPosition = ref<TooltipPosition>('tooltip-bottom')

// 计算属性
const markerClass = computed(() => {
  return [
    `marker-${props.marker.status}`,
    { 'marker-hover': isHovered.value }
  ]
})

// 事件处理函数
const handleMouseEnter = (event: MouseEvent): void => {
  isHovered.value = true
  
  // 智能定位逻辑
  const target = event.target as HTMLElement
  const rect = target.getBoundingClientRect()
  const tooltipHeight = 80 // 估算的提示框高度
  
  if (rect.top < tooltipHeight + 20) {
    tooltipPosition.value = 'tooltip-top'
  } else {
    tooltipPosition.value = 'tooltip-bottom'
  }
}

const handleMouseLeave = (): void => {
  isHovered.value = false
}

const handleClick = (): void => {
  emit('click', props.marker)
}

// 工具函数
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    '运营中': '正常运营',
    '维护中': '设备维护',
    '暂停服务': '暂停服务',
    '建设中': '建设中'
  }
  return statusMap[status] || status
}

// 根据状态获取对应的图标
const getMarkerIcon = (): string => {
  // 如果传入了自定义图标，优先使用
  if (props.stationIcon && props.batteryIcon) {
    const iconMap: Record<string, string> = {
      '运营中': props.batteryIcon, // 使用传入的电池图标
      '维护中': props.batteryIcon, // 使用传入的电池图标
      '暂停服务': props.stationIcon, // 使用传入的换电站图标
      '建设中': props.stationIcon // 使用传入的换电站图标
    }
    return iconMap[props.marker.status] || props.stationIcon
  }
  
  // 根据换电站类型选择不同的图标
  const iconByType: Record<string, string> = {
    '电动自行车换电站': 'icon-saomahuandian-huandianzhan', // 电动车换电站图标
    '电动汽车换电站': 'icon-chongdianzhan' // 汽车换电站图标
  }
  
  return iconByType[props.marker.stationType] || 'icon-chongdianzhan'
}
</script>

<style scoped>
.custom-marker {
  position: relative;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center center;
  /* 确保标记中心点与地图坐标点对齐 */
  transform: translate(-50%, -50%);
}

.custom-marker:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.marker-icon {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.marker-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.custom-marker:hover .marker-icon::before {
  transform: translateX(100%);
}

.marker-icon i {
  color: white;
  font-size: 20px;
  z-index: 1;
  position: relative;
}

/* 不同状态的样式 - 统一使用换电站图标，通过颜色区分状态 */
.marker-运营中 .marker-icon {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
}

.marker-运营中 .marker-icon i {
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.marker-维护中 .marker-icon {
  background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.4);
}

.marker-维护中 .marker-icon i {
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  opacity: 0.8;
}

.marker-暂停服务 .marker-icon {
  background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);
}

.marker-暂停服务 .marker-icon i {
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  opacity: 0.6;
}

.marker-建设中 .marker-icon {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.marker-建设中 .marker-icon i {
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  opacity: 0.7;
}

/* 状态指示器 - 外围边框 */
.status-indicator {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.status-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid transparent;
  background: transparent;
  animation: pulse 2s infinite;
  box-sizing: border-box;
}

.marker-运营中 .status-ring {
  border-color: #52c41a;
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.6);
}

.marker-维护中 .status-ring {
  border-color: #faad14;
  box-shadow: 0 0 8px rgba(250, 173, 20, 0.6);
}

.marker-暂停服务 .status-ring {
  border-color: #ff4d4f;
  box-shadow: 0 0 8px rgba(255, 77, 79, 0.6);
}

.marker-建设中 .status-ring {
  border-color: #1890ff;
  box-shadow: 0 0 8px rgba(24, 144, 255, 0.6);
}

/* 可用数量标签 */
.available-count {
  position: absolute;
  bottom: -12px;
  right: -12px;
  background: #ff4d4f;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: bounce 1s infinite;
  z-index: 2;
}

/* 悬停提示 */
.tooltip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  pointer-events: none;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.tooltip-bottom {
  bottom: 70px;
}

.tooltip-top {
  top: 70px;
}

.tooltip-content {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.9) 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
}

.tooltip-bottom .tooltip-content::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 10px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.95);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.tooltip-top .tooltip-content::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 10px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.95);
  filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.3));
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 6px;
  color: #fff;
  font-size: 13px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.tooltip-status {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.status-text {
  color: #52c41a;
  font-weight: 500;
  font-size: 11px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.available-text {
  color: #d9d9d9;
  font-size: 10px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.tooltip-radius {
  margin-top: 6px;
  padding: 4px 10px;
  background: rgba(24, 144, 255, 0.08);
  border-radius: 8px;
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #1890ff;
  font-weight: 500;
  gap: 4px;
}

.tooltip-radius .iconfont {
  font-size: 15px;
  color: #40a9ff;
  margin-right: 4px;
}

.radius-label {
  color: #1890ff;
  font-weight: 500;
}

.radius-value {
  font-size: 16px;
  font-weight: bold;
  color: #096dd9;
  margin: 0 2px;
}

.radius-unit {
  font-size: 12px;
  color: #888;
  margin-left: 2px;
}

/* 动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

/* 悬停时的额外效果 */
.marker-hover .marker-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.marker-hover.marker-运营中 .marker-icon {
  box-shadow: 0 6px 20px rgba(82, 196, 26, 0.6);
}

.marker-hover.marker-运营中 .marker-icon i {
  opacity: 1;
  transform: scale(1.1);
}

.marker-hover.marker-维护中 .marker-icon {
  box-shadow: 0 6px 20px rgba(250, 173, 20, 0.6);
}

.marker-hover.marker-维护中 .marker-icon i {
  opacity: 0.9;
  transform: scale(1.1);
}

.marker-hover.marker-暂停服务 .marker-icon {
  box-shadow: 0 6px 20px rgba(255, 77, 79, 0.6);
}

.marker-hover.marker-暂停服务 .marker-icon i {
  opacity: 0.8;
  transform: scale(1.1);
}

.marker-hover.marker-建设中 .marker-icon {
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.6);
}

.marker-hover.marker-建设中 .marker-icon i {
  opacity: 0.9;
  transform: scale(1.1);
}
</style>