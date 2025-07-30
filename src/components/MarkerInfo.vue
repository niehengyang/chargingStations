<template>
  <el-dialog
    v-model="dialogVisible"
    title="换电站详细信息"
    width="70%"
    max-width="600px"
    :before-close="handleClose"
    :destroy-on-close="true"
    :modal="false"
    :close-on-click-modal="false"
    class="marker-info-dialog"
  >
    <div v-if="markerData" class="marker-info-content">
      <!-- 顶部状态栏 -->
      <div class="status-header">
        <div class="station-status">
          <el-tag 
            :type="getStatusType(markerData.status)"
            size="default"
            class="status-tag"
          >
            {{ markerData.status }}
          </el-tag>
        </div>
        <div class="station-type">
          <el-tag type="info" size="small">{{ markerData.stationType }}</el-tag>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧：照片和基本信息 -->
        <div class="left-panel">
          <!-- 换电站照片 -->
          <div class="photo-section">
            <div v-if="markerData.photos && markerData.photos.length > 0" class="photo-gallery">
              <!-- 主照片展示 -->
              <div class="main-photo">
                <el-image
                  :src="getPhotoUrl(currentPhoto?.path) || ''"
                  :preview-src-list="photoUrlList"
                  :initial-index="currentPhotoIndex"
                  fit="cover"
                  class="main-photo-image"
                  @error="handleImageError"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>图片加载失败</span>
                    </div>
                  </template>
                </el-image>
                <div class="photo-info">
                  <span class="photo-description">{{ currentPhoto?.description || '' }}</span>
                  <span class="photo-count">{{ currentPhotoIndex + 1 }} / {{ markerData.photos.length }}</span>
                </div>
              </div>
              
              <!-- 照片缩略图 -->
              <div v-if="markerData.photos.length > 1" class="photo-thumbnails">
                <div
                  v-for="(photo, index) in markerData.photos"
                  :key="photo.id"
                  class="thumbnail-item"
                  :class="{ active: index === currentPhotoIndex }"
                  @click="setCurrentPhoto(index)"
                >
                  <el-image
                    :src="getPhotoUrl(photo.path)"
                    fit="cover"
                    class="thumbnail-image"
                    @error="handleThumbnailError"
                  >
                    <template #error>
                      <div class="thumbnail-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>
            </div>
            
            <!-- 无照片时的占位符 -->
            <div v-else class="photo-placeholder">
              <el-icon class="photo-icon"><Picture /></el-icon>
              <span class="photo-text">暂无照片</span>
            </div>
          </div>

          <!-- 基本信息卡片 -->
          <div class="info-card">
            <h3 class="card-title">
              <el-icon><Location /></el-icon>
              基本信息
            </h3>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">站点编号</span>
                <span class="info-value">{{ markerData.id }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">站点名称</span>
                <span class="info-value">{{ markerData.name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">运营方</span>
                <span class="info-value">{{ markerData.basicInfo.owner }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">运营商</span>
                <span class="info-value">{{ markerData.basicInfo.operator }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">联系电话</span>
                <span class="info-value">{{ markerData.basicInfo.contactPhone }}</span>
              </div>
              <div class="info-row" v-if="markerData.basicInfo.establishmentDate">
                <span class="info-label">建立日期</span>
                <span class="info-value">{{ markerData.basicInfo.establishmentDate }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">所在省份</span>
                <span class="info-value">{{ markerData.province || '未提供' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">所在城市</span>
                <span class="info-value">{{ markerData.city || '未提供' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">所在区域</span>
                <span class="info-value">{{ markerData.district || '未提供' }}</span>
              </div>
              <div class="info-row full-width">
                <span class="info-label">详细地址</span>
                <span class="info-value">{{ markerData.address }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">坐标位置</span>
                <span class="info-value">{{ markerData.coordinates.latitude }}, {{ markerData.coordinates.longitude }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">服务半径</span>
                <span class="info-value">{{ markerData.serviceRadius }} 公里</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：电池柜信息和站点描述 -->
        <div class="right-panel">
          <!-- 电池柜信息 -->
          <div class="battery-cabinets-card">
            <h3 class="card-title">
              <el-icon><Tools /></el-icon>
              电池柜信息
            </h3>
            <div class="battery-cabinets-list">
              <div 
                v-for="cabinet in markerData.batteryCabinets" 
                :key="cabinet.cabinetId"
                class="cabinet-item"
              >
                <div class="cabinet-header">
                  <span class="cabinet-id">{{ cabinet.cabinetId }}</span>
                  <el-tag 
                    :type="getCabinetStatusType(cabinet.status)"
                    size="small"
                  >
                    {{ cabinet.status }}
                  </el-tag>
                </div>
                <div class="cabinet-details">
                  <div class="cabinet-row">
                    <span class="cabinet-label">供应商</span>
                    <span class="cabinet-value">{{ cabinet.supplier }}</span>
                  </div>
                  <div class="cabinet-row">
                    <span class="cabinet-label">电池数量</span>
                    <span class="cabinet-value">{{ cabinet.batteryCount }}</span>
                  </div>
                  <div class="cabinet-row">
                    <span class="cabinet-label">电池类型</span>
                    <span class="cabinet-value">{{ cabinet.batteryType }}</span>
                  </div>
                  <div class="cabinet-row">
                    <span class="cabinet-label">容量</span>
                    <span class="cabinet-value">{{ cabinet.capacity }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 站点描述 -->
          <div class="description-card">
            <h3 class="card-title">
              <el-icon><Document /></el-icon>
              站点描述
            </h3>
            <div class="description-content">
              {{ markerData.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <el-icon class="no-data-icon"><Warning /></el-icon>
      <span>暂无数据</span>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Picture, 
  Location, 
  Lightning, 
  Document, 
  Check, 
  Share, 
  Warning,
  Service,
  Wallet,
  Tools,
  Phone
} from '@element-plus/icons-vue'
import { ENV_CONFIG } from '../config/env'

interface Photo {
  id: string
  filename: string
  path: string
  description: string
  uploadTime: string
  size: number
}

interface BatterySwapStation {
  id: string
  name: string
  stationType: string
  coordinates: {
    latitude: number
    longitude: number
  }
  address: string
  province?: string
  city?: string
  district?: string
  status: string
  basicInfo: {
    owner: string
    operator: string
    contactPhone: string
    operatingHours: string
    establishmentDate?: string
  }
  operationStatus: {
    totalBatteryCabinets: number
    availableCabinets: number
    inUseCabinets: number
    maintenanceCabinets: number
    dailySwapCount: number
    averageSwapTime: string
  }
  maintenanceInfo: {
    lastMaintenance: string
    nextMaintenance: string
    maintenanceStatus?: string
    maintenanceTeam?: string
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
  photos?: Photo[]
  serviceRadius?: number
}

const dialogVisible = ref(false)
const markerData = ref<BatterySwapStation | null>(null)
const currentPhotoIndex = ref(0)

// 计算当前照片
const currentPhoto = computed(() => {
  if (!markerData.value?.photos || markerData.value.photos.length === 0) {
    return null
  }
  return markerData.value.photos[currentPhotoIndex.value]
})

// 计算照片列表（用于预览）
const photoList = computed(() => {
  if (!markerData.value?.photos) return []
  return markerData.value.photos.map(photo => photo.path)
})

// 计算完整照片URL列表（用于预览）
const photoUrlList = computed(() => {
  if (!markerData.value?.photos) return []
  return markerData.value.photos.map(photo => getPhotoUrl(photo.path))
})

// 获取完整的照片URL
const getPhotoUrl = (path: string | undefined): string => {
  if (!path) return ''
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // 拼接服务器基础URL
  return `${ENV_CONFIG.API_BASE_URL}${path}`
}

const getStatusType = (status: string) => {
  switch (status) {
    case '运营中':
      return 'success'
    case '维护中':
      return 'warning'
    case '暂停服务':
      return 'danger'
    case '建设中':
      return 'info'
    default:
      return 'info'
  }
}

const getCabinetStatusType = (status: string) => {
  switch (status) {
    case '可用':
      return 'success'
    case '使用中':
      return 'warning'
    case '维护中':
      return 'danger'
    default:
      return 'info'
  }
}

// 设置当前照片
const setCurrentPhoto = (index: number) => {
  currentPhotoIndex.value = index
}

// 处理图片加载错误
const handleImageError = () => {
  ElMessage.warning('图片加载失败')
}

// 处理缩略图加载错误
const handleThumbnailError = () => {
  // 缩略图加载失败时不显示消息，只显示错误图标
}

const openDialog = (data: BatterySwapStation) => {
  markerData.value = data
  currentPhotoIndex.value = 0 // 重置照片索引
  dialogVisible.value = true
}

const handleClose = (done: () => void) => {
  done()
}

defineExpose({
  markerData,
  openDialog
})
</script>

<style scoped>
.marker-info-dialog :deep(.el-dialog) {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  max-height: 90vh !important;
  width: 90vw !important;
  max-width: 600px !important;
  min-width: 320px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.marker-info-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
  padding: 12px 16px;
  flex-shrink: 0; /* 防止header被压缩 */
}

.marker-info-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.marker-info-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 16px;
}

.marker-info-dialog :deep(.el-dialog__body) {
  flex: 1 1 auto;
  max-height: calc(90vh - 60px); /* 60px 预留header/footer */
  overflow-y: auto;
  overflow-x: hidden; /* 防止水平滚动 */
  padding: 0;
  min-height: 0; /* 允许flex子元素收缩 */
}

.marker-info-content {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部状态栏 */
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0; /* 防止被压缩 */
}

.station-status .status-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
}

.station-type {
  display: flex;
  align-items: center;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  gap: 10px;
  padding: 10px;
  min-height: 0; /* 允许收缩 */
  flex: 1; /* 占用剩余空间 */
  overflow: hidden; /* 防止溢出 */
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0; /* 允许收缩 */
  overflow: hidden; /* 防止溢出 */
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0; /* 允许收缩 */
  overflow: hidden; /* 防止溢出 */
}

/* 照片区域 */
.photo-section {
  margin-bottom: 0;
  flex-shrink: 0; /* 防止被压缩 */
}

.photo-gallery {
  width: 100%;
}

.main-photo {
  width: 100%;
  margin-bottom: 8px;
}

.main-photo-image {
  width: 100%;
  height: 250px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
}

.main-photo-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.photo-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 12px;
}

.photo-description {
  color: #606266;
  font-weight: 500;
}

.photo-count {
  color: #909399;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.photo-thumbnails {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.photo-thumbnails::-webkit-scrollbar {
  height: 4px;
}

.photo-thumbnails::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.photo-thumbnails::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.thumbnail-item {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail-item:hover {
  border-color: #409eff;
  transform: scale(1.05);
}

.thumbnail-item.active {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-error,
.thumbnail-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f5f5;
  color: #909399;
  font-size: 12px;
}

.thumbnail-error {
  font-size: 16px;
}

.photo-placeholder {
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d9d9d9;
  transition: all 0.3s ease;
}

.photo-placeholder:hover {
  border-color: #409eff;
  background: linear-gradient(135deg, #e6f7ff 0%, #b3d8ff 100%);
}

.photo-icon {
  font-size: 40px;
  color: #909399;
  margin-bottom: 8px;
}

.photo-text {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

/* 卡片通用样式 */
.info-card,
.status-card,
.battery-cabinets-card,
.maintenance-card,
.description-card {
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
  flex-shrink: 0; /* 防止被压缩 */
}

/* 基本信息 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto; /* 允许滚动 */
  min-height: 0; /* 允许收缩 */
}

.info-row {
  display: flex;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
  flex-shrink: 0; /* 防止被压缩 */
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.full-width {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.info-label {
  color: #606266;
  font-weight: 500;
  min-width: 70px;
  font-size: 12px;
}

.info-value {
  color: #303133;
  font-weight: 600;
  font-size: 12px;
  flex: 1;
  word-break: break-word; /* 防止长文本溢出 */
}

/* 电池柜信息 */
.battery-cabinets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto; /* 允许滚动 */
  min-height: 0; /* 允许收缩 */
}

.cabinet-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px;
  border: 1px solid #e9ecef;
  flex-shrink: 0; /* 防止被压缩 */
}

.cabinet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.cabinet-id {
  font-weight: 600;
  font-size: 12px;
  color: #303133;
}

.cabinet-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cabinet-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.cabinet-label {
  color: #606266;
  font-weight: 500;
}

.cabinet-value {
  color: #303133;
  font-weight: 600;
  word-break: break-word; /* 防止长文本溢出 */
}

/* 运行情况 */
.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0; /* 防止被压缩 */
}

.status-item {
  text-align: center;
  padding: 12px 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.status-item.available {
  border-color: #67c23a;
  background: #f0f9ff;
}

.status-item.charging {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.status-item.maintenance {
  border-color: #f56c6c;
  background: #fef0f0;
}

.status-number {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.status-item.available .status-number {
  color: #67c23a;
}

.status-item.charging .status-number {
  color: #e6a23c;
}

.status-item.maintenance .status-number {
  color: #f56c6c;
}

.status-label {
  font-size: 11px;
  color: #909399;
  font-weight: 500;
}

/* 运营统计 */
.operation-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  flex-shrink: 0; /* 防止被压缩 */
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.stat-label {
  color: #606266;
  font-weight: 500;
  font-size: 12px;
}

.stat-value {
  color: #303133;
  font-weight: 600;
  font-size: 12px;
}

/* 维护信息 */
.maintenance-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto; /* 允许滚动 */
  min-height: 0; /* 允许收缩 */
}

.maintenance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
  flex-shrink: 0; /* 防止被压缩 */
}

.maintenance-row:last-child {
  border-bottom: none;
}

.maintenance-label {
  color: #606266;
  font-weight: 500;
  font-size: 12px;
}

.maintenance-value {
  color: #303133;
  font-weight: 600;
  font-size: 12px;
  word-break: break-word; /* 防止长文本溢出 */
}

/* 站点描述 */
.description-content {
  line-height: 1.5;
  color: #606266;
  font-size: 12px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #67c23a;
  flex: 1;
  overflow-y: auto; /* 允许滚动 */
  word-break: break-word; /* 防止长文本溢出 */
}

/* 无数据状态 */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  color: #909399;
}

.no-data-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .marker-info-dialog :deep(.el-dialog) {
    width: 95vw !important;
    max-width: 95vw !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
  }
  
  .main-content {
    gap: 8px;
    padding: 8px;
  }
  
  .info-card,
  .status-card,
  .battery-cabinets-card,
  .maintenance-card,
  .description-card {
    padding: 8px;
  }
}

@media (max-width: 1000px) {
  .marker-info-dialog :deep(.el-dialog) {
    width: 98vw !important;
    max-width: 98vw !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
  }
  
  .marker-info-dialog :deep(.el-dialog__body) {
    max-height: calc(96vh - 60px);
  }
  
  .main-content {
    flex-direction: column;
    gap: 8px;
  }
  
  .left-panel,
  .right-panel {
    flex: none;
  }
  
  .status-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .marker-info-dialog :deep(.el-dialog) {
    width: 98vw !important;
    max-width: 98vw !important;
    min-width: unset;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    max-height: 98vh !important;
  }
  
  .marker-info-dialog :deep(.el-dialog__body) {
    max-height: calc(98vh - 60px);
  }
  
  .status-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .main-content {
    padding: 8px;
  }
  
  .status-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .maintenance-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .main-photo-image {
    height: 150px;
  }
  
  .thumbnail-item {
    width: 50px;
    height: 50px;
  }
  
  .card-title {
    font-size: 13px;
  }
  
  .info-label,
  .info-value,
  .maintenance-label,
  .maintenance-value,
  .cabinet-label,
  .cabinet-value,
  .stat-label,
  .stat-value {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .marker-info-dialog :deep(.el-dialog) {
    width: 100vw !important;
    max-width: 100vw !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    height: 100vh !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }
  
  .marker-info-dialog :deep(.el-dialog__body) {
    max-height: calc(100vh - 60px);
  }
  
  .main-content {
    padding: 6px;
    gap: 6px;
  }
  
  .info-card,
  .status-card,
  .battery-cabinets-card,
  .maintenance-card,
  .description-card {
    padding: 6px;
  }
  
  .status-header {
    padding: 8px 12px;
  }
  
  .main-photo-image {
    height: 120px;
  }
  
  .thumbnail-item {
    width: 40px;
    height: 40px;
  }
  
  .status-grid {
    gap: 6px;
  }
  
  .status-item {
    padding: 8px 6px;
  }
  
  .status-number {
    font-size: 16px;
  }
  
  .status-label {
    font-size: 10px;
  }
}
</style>