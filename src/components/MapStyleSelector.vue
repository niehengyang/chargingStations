<template>
  <div class="map-style-selector">
    <div class="style-selector-header">
      <span class="style-selector-title">地图主题</span>
      <el-button 
        type="text" 
        class="close-button" 
        @click="handleClose"
        :icon="Close"
        size="small"
      />
    </div>
    <div class="style-button-container">
      <div 
        v-for="style in mapStyles" 
        :key="style.key"
        class="style-button"
        :class="{ 
          active: currentStyle === style.key,
          'changing': isChanging && currentStyle === style.key 
        }"
        @click="selectStyle(style.key)"
        :title="style.name"
        :style="{ pointerEvents: isChanging ? 'none' : 'auto' }"
      >
        <div class="style-preview" :style="{ backgroundColor: style.color }"></div>
        <span class="style-name">{{ style.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Close } from '@element-plus/icons-vue'

const emit = defineEmits(['style-change', 'close'])

const currentStyle = ref('normal')
const isChanging = ref(false)

const mapStyles = [
  {
    key: 'normal',
    name: '标准',
    color: '#ffffff',
    url: 'amap://styles/normal'
  },
  {
    key: 'dark',
    name: '幻影黑',
    color: '#1a1a1a',
    url: 'amap://styles/dark'
  },
  {
    key: 'light',
    name: '月光银',
    color: '#f5f5f5',
    url: 'amap://styles/light'
  },
  {
    key: 'whitesmoke',
    name: '远山黛',
    color: '#f8f9fa',
    url: 'amap://styles/whitesmoke'
  },
  {
    key: 'fresh',
    name: '草色青',
    color: '#e8f5e8',
    url: 'amap://styles/fresh'
  },
  {
    key: 'grey',
    name: '雅士灰',
    color: '#f0f0f0',
    url: 'amap://styles/grey'
  },
  {
    key: 'graffiti',
    name: '涂鸦',
    color: '#ff6b6b',
    url: 'amap://styles/graffiti'
  },
  {
    key: 'macaron',
    name: '马卡龙',
    color: '#ffd93d',
    url: 'amap://styles/macaron'
  },
  {
    key: 'blue',
    name: '靛青蓝',
    color: '#4ecdc4',
    url: 'amap://styles/blue'
  },
  {
    key: 'darkblue',
    name: '极夜蓝',
    color: '#2c3e50',
    url: 'amap://styles/darkblue'
  },
  {
    key: 'wine',
    name: '酱籽',
    color: '#e74c3c',
    url: 'amap://styles/wine'
  }
]

const selectStyle = async (styleKey: string) => {
  // 防止重复点击同一样式或正在切换中
  if (currentStyle.value === styleKey || isChanging.value) {
    return
  }
  
  isChanging.value = true
  currentStyle.value = styleKey
  
  const selectedStyle = mapStyles.find(style => style.key === styleKey)
  if (selectedStyle) {
    try {
      // 使用 nextTick 确保 DOM 更新后再触发样式变化
      await nextTick()
      emit('style-change', selectedStyle.url)
      
      // 添加短暂延迟确保地图样式切换完成
      setTimeout(() => {
        isChanging.value = false
      }, 300)
    } catch (error) {
      console.error('地图样式切换失败:', error)
      isChanging.value = false
    }
  } else {
    isChanging.value = false
  }
}

// 关闭组件
const handleClose = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
.map-style-selector {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1500;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px;
}

.style-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 4px;
}

.style-selector-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.close-button {
  color: #666;
  padding: 4px;
  
  &:hover {
    color: #409eff;
    background-color: rgba(64, 158, 255, 0.1);
  }
}

.style-button-container {
  display: flex;
  flex-direction: row;
  gap: 6px;
  max-width: calc(100vw - 40px);
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
  }
}

.style-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 90px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
    
    .style-name {
      color: white;
      font-weight: 600;
    }
  }
  
  &.changing {
    opacity: 0.7;
    transform: translateY(-2px) scale(0.95);
    
    .style-preview {
      animation: pulse 1s infinite;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.style-preview {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  .active & {
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
}

.style-name {
  font-size: 11px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  transition: color 0.3s ease;
}

// 响应式设计
@media (max-width: 768px) {
  .map-style-selector {
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .style-button-container {
    padding: 6px;
    max-width: calc(100vw - 20px);
    gap: 4px;
  }
  
  .style-button {
    min-width: 70px;
    padding: 4px 6px;
    gap: 4px;
  }
  
  .style-name {
    font-size: 10px;
  }
  
  .style-preview {
    width: 14px;
    height: 14px;
  }
}
</style>