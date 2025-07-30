<template>
  <div ref="menuRef" class="circle-menu" :class="{ open: isOpen }">
    <div
      v-for="(item, idx) in menuItems"
      :key="item.label"
      class="menu-item-container"
      :class="{ 
        open: isOpen, 
        'label-left': item.label === '创建站点' 
      }"
      :style="getContainerStyle(idx)"
    >
      <div class="menu-item" @click="item.action" :style="{ background: item.color }">
        <div class="icon-wrapper">
          <el-icon><component :is="item.icon" /></el-icon>
        </div>
      </div>
      <span class="label">{{ item.label }}</span>
    </div>
    <div class="menu-toggle" :class="{ rotated: isOpen }" @click="toggleMenu">
      <span v-if="!isOpen" class="menu-svg">
        <!-- 菜单图标 ≡ -->
        <svg width="32" height="32" viewBox="0 0 32 32"><rect x="7" y="10" width="18" height="2" rx="1" fill="#fff"/><rect x="7" y="15" width="18" height="2" rx="1" fill="#fff"/><rect x="7" y="20" width="18" height="2" rx="1" fill="#fff"/></svg>
      </span>
      <span v-else class="menu-svg">
        <!-- 关闭图标 × -->
        <svg width="32" height="32" viewBox="0 0 32 32"><line x1="10" y1="10" x2="22" y2="22" stroke="#fff" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="10" x2="10" y2="22" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Promotion, Setting, Location, List } from '@element-plus/icons-vue'
import type { Component } from 'vue'

interface MenuItem {
  label: string
  icon: Component
  color: string
  action: () => void
}

const emit = defineEmits(['menu-click'])

const isOpen = ref(false)
const menuRef = ref<HTMLElement>()
const toggleMenu = (event: MouseEvent) => {
  event.stopPropagation()
  isOpen.value = !isOpen.value
}

// 点击外部区域关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const menuItems: MenuItem[] = [
  { label: '线路规划', icon: Promotion, color: '#6fd96f', action: () => handleMenuClick('线路规划') },
  { label: '主题设置', icon: Setting, color: '#5faaff', action: () => handleMenuClick('主题设置') },
  { label: '创建站点', icon: Location, color: '#ff5f7f', action: () => handleMenuClick('创建站点') },
  { label: '列表管理', icon: List, color: '#ffb14f', action: () => handleMenuClick('列表管理') },
]

function handleMenuClick(label: string) {
  emit('menu-click', label)
}

const getContainerStyle = (idx: number) => {
  const total = menuItems.length;
  const angle = (Math.PI * 2 / total) * idx - Math.PI / 2; // -90度开始
  const radius = isOpen.value ? 90 : 0; // 展开半径
  const delay = isOpen.value ? `${idx * 0.07}s` : `${(total - idx) * 0.04}s`;
  // 使用三角函数计算位置
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return {
    transform: `translate(${x}px, ${y}px) scale(${isOpen.value ? 1 : 0.5})`,
    opacity: isOpen.value ? 1 : 0,
    transition: `
      transform 0.35s cubic-bezier(.68,-0.55,.27,1.55) ${delay},
      opacity 0.2s ${delay}
    `,
    zIndex: 1000 - idx,
  };
}
</script>

<style scoped>
.circle-menu {
  width: 70px;
  height: 70px;
  z-index: 2000;
  position: relative;
}
.menu-toggle {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #7fd8e5 0%, #5e7d82 100%);
  border-radius: 50%;
  box-shadow: 0 4px 16px 0 rgba(94,125,130,0.18), 0 1.5px 8px 0 rgba(127,216,229,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 32px;
  position: absolute;
  right: 0;
  bottom: 0;
  transition: background 0.2s, transform 0.4s cubic-bezier(.68,-0.55,.27,1.55), box-shadow 0.2s;
  border: none;
  outline: none;
  z-index: 3000;
}
.menu-toggle:hover {
  background: linear-gradient(135deg, #a2eaf2 0%, #6fa3b6 100%);
  box-shadow: 0 8px 24px 0 rgba(94,125,130,0.22), 0 2px 12px 0 rgba(127,216,229,0.18);
}
.menu-toggle .menu-svg {
  display: flex;
  align-items: center;
  justify-content: center;
}
.menu-toggle.rotated {
  transform: rotate(225deg);
}
.menu-item-container {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 54px;
  height: 54px;
  opacity: 0;
  pointer-events: none;
  transform: scale(0.5);
  transition:
    transform 0.35s cubic-bezier(.68,-0.55,.27,1.55),
    opacity 0.2s;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.menu-item-container.open {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
}
.menu-item {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(94,125,130,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
}
.menu-item:hover {
  box-shadow: 0 6px 24px rgba(94,125,130,0.22), 0 2px 12px rgba(127,216,229,0.18);
  transform: scale(1.12);
  z-index: 3000;
}
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: white;
}

/* 默认标签样式（按钮正上方） */
.label {
  position: absolute;
  top: -60px;
  background: #fff;
  color: #333;
  padding: 8px 18px;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.13);
  font-weight: bold;
  font-size: 15px;
  white-space: nowrap;
  z-index: 2000;
  pointer-events: none;
  border: 1px solid #f0f0f0;
  letter-spacing: 1px;
  opacity: 0;
  transition: opacity 0.2s;
  text-align: center;
  display: none;
}
.label::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-top-color: #fff;
}

/* 特殊样式：标签在按钮左侧（仅用于创建标记按钮） */
.menu-item-container.label-left .label {
  top: 50%;
  left: -150px; /* 左侧位置 */
  transform: translateY(-50%);
  display: none;
  opacity: 0;
}
.menu-item-container.label-left .label::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -16px;
  left: auto;
  bottom: auto;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-left-color: #fff; /* 箭头指向右侧（按钮方向） */
}

/* 鼠标悬停时显示标签 */
.menu-item-container:hover .label {
  display: block;
  opacity: 1;
}
</style>
