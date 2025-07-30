<template>
  <div class="icon-switcher">
    <div class="switcher-header">
      <h3>图标切换器</h3>
      <p>快速切换充电站和充电桩图标组合</p>
    </div>
    
    <div class="preset-combinations">
      <div 
        v-for="preset in iconPresets" 
        :key="preset.id"
        class="preset-option"
        :class="{ active: currentPreset === preset.id }"
        @click="selectPreset(preset.id)"
      >
        <div class="preset-preview">
          <div class="preview-marker marker-运营中">
            <div class="marker-icon">
              <i :class="`iconfont ${preset.pileIcon}`"></i>
            </div>
            <div class="status-indicator">
              <div class="status-dot"></div>
            </div>
          </div>
          <div class="preview-marker marker-暂停服务">
            <div class="marker-icon">
              <i :class="`iconfont ${preset.stationIcon}`"></i>
            </div>
            <div class="status-indicator">
              <div class="status-dot"></div>
            </div>
          </div>
        </div>
        <div class="preset-info">
          <h4>{{ preset.name }}</h4>
          <p>{{ preset.description }}</p>
        </div>
      </div>
    </div>
    
    <div class="current-selection" v-if="currentPreset">
      <h4>当前选择：{{ getCurrentPresetName() }}</h4>
      <div class="selection-details">
        <div class="detail-item">
          <span class="label">充电站图标：</span>
          <span class="value">{{ getCurrentStationIcon() }}</span>
        </div>
        <div class="detail-item">
          <span class="label">充电桩图标：</span>
          <span class="value">{{ getCurrentPileIcon() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 图标预设组合
const iconPresets = [
  {
    id: 'default',
    name: '默认组合',
    description: '经典充电站和充电桩图标',
    stationIcon: 'icon-chongdianzhan',
    pileIcon: 'icon-chongdianzhuang'
  },
  {
    id: 'green',
    name: '绿色主题',
    description: '绿色充电桩，适合环保主题',
    stationIcon: 'icon-chongdianzhan2',
    pileIcon: 'icon-lvsechongdianzhuang'
  },
  {
    id: 'electric',
    name: '电动车主题',
    description: '电动车图标，更直观',
    stationIcon: 'icon-chongdianzhan1',
    pileIcon: 'icon-diandongche'
  },
  {
    id: 'modern',
    name: '现代简约',
    description: '简洁的图标设计',
    stationIcon: 'icon-chongdianzhan',
    pileIcon: 'icon-001diandongche'
  }
]

// 当前选中的预设
const currentPreset = ref('default')

// 选择预设
const selectPreset = (presetId: string) => {
  currentPreset.value = presetId
}

// 获取当前预设名称
const getCurrentPresetName = (): string => {
  const preset = iconPresets.find(p => p.id === currentPreset.value)
  return preset ? preset.name : '未知'
}

// 获取当前充电站图标
const getCurrentStationIcon = (): string => {
  const preset = iconPresets.find(p => p.id === currentPreset.value)
  return preset ? preset.stationIcon : 'icon-chongdianzhan'
}

// 获取当前充电桩图标
const getCurrentPileIcon = (): string => {
  const preset = iconPresets.find(p => p.id === currentPreset.value)
  return preset ? preset.pileIcon : 'icon-chongdianzhuang'
}

// 暴露当前选中的图标给父组件
defineExpose({
  currentPreset,
  getCurrentStationIcon,
  getCurrentPileIcon
})
</script>

<style scoped>
.icon-switcher {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 800px;
}

.switcher-header {
  margin-bottom: 24px;
  text-align: center;
}

.switcher-header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.switcher-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.preset-combinations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.preset-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.preset-option:hover {
  border-color: #1890ff;
  background: #f0f8ff;
  transform: translateY(-2px);
}

.preset-option.active {
  border-color: #1890ff;
  background: #e6f7ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.preset-preview {
  display: flex;
  gap: 12px;
  align-items: center;
}

.preview-marker {
  position: relative;
  width: 32px;
  height: 32px;
}

.preview-marker .marker-icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.preview-marker .marker-icon i {
  color: white;
  font-size: 16px;
}

.preview-marker.marker-运营中 .marker-icon {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.preview-marker.marker-暂停服务 .marker-icon {
  background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
}

.status-indicator {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: white;
}

.marker-运营中 .status-dot {
  background: #52c41a;
}

.marker-暂停服务 .status-dot {
  background: #ff4d4f;
}

.preset-info {
  flex: 1;
}

.preset-info h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.preset-info p {
  margin: 0;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

.current-selection {
  padding: 16px;
  background: #f6f8fa;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.current-selection h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.selection-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item .label {
  color: #666;
  font-size: 12px;
}

.detail-item .value {
  color: #1890ff;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Courier New', monospace;
}
</style> 