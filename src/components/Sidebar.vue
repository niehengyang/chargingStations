<template>
  <div class="sidebar-container">
    <!-- 外部触发按钮 -->
    <div class="sidebar-trigger" @click="toggleSidebar">
      <el-icon class="trigger-icon">
        <Menu />
      </el-icon>
    </div>

    <!-- 侧边栏内容 -->
    <el-drawer
      v-model="visible"
      title="换电站列表"
      direction="rtl"
      size="400px"
      :with-header="true"
      :before-close="handleClose"
      class="custom-drawer"
    >
      <div class="sidebar-content">
        <!-- 搜索框 -->
        <div class="search-section">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索换电站名称或地址"
            clearable
            @input="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 区县筛选 -->
        <div class="filter-section">
          <div class="filter-title">按区县筛选</div>
          <el-select
            v-model="selectedDistrict"
            placeholder="选择区县"
            clearable
            @change="handleDistrictFilter"
            class="district-select"
          >
            <el-option
              v-for="district in districts"
              :key="district"
              :label="district"
              :value="district"
            />
          </el-select>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <el-card class="stats-card">
            <div class="stats-item">
              <span class="stats-label">总站数：</span>
              <span class="stats-value">{{ filteredStations.length }}</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">可用电池柜：</span>
              <span class="stats-value">{{ totalAvailableCabinets }}</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">总电池柜：</span>
              <span class="stats-value">{{ totalBatteryCabinets }}</span>
            </div>
          </el-card>
        </div>

        <!-- 换电站列表 -->
        <div class="station-list">
          <el-scrollbar height="calc(100vh - 300px)">
            <div
              v-for="station in filteredStations"
              :key="station.id"
              class="station-item"
            >
              <div class="station-header">
                <h4 class="station-name" @click="selectStation(station)">{{ station.name }}</h4>
                <div class="station-actions">
                  <el-tag
                    :type="getStatusType(station.status)"
                    size="small"
                    class="status-tag"
                  >
                    {{ station.status }}
                  </el-tag>
                  <el-button
                    type="primary"
                    size="small"
                    :icon="Edit"
                    circle
                    @click.stop="handleEditStation(station)"
                    class="edit-btn"
                    title="编辑"
                  />
                  <el-button
                    type="danger"
                    size="small"
                    icon="Delete"
                    circle
                    @click="handleDeleteStation(station)"
                    class="delete-btn"
                    title="删除"
                  />
                </div>
              </div>
              
              <div class="station-info" @click="selectStation(station)">
                <div class="info-row">
                  <el-icon><Location /></el-icon>
                  <span class="info-text">{{ station.address }}</span>
                </div>
                
                <div class="info-row">
                  <el-icon><Phone /></el-icon>
                  <span class="info-text">{{ station.basicInfo.contactPhone }}</span>
                </div>
                
                <div class="info-row">
                  <el-icon><Clock /></el-icon>
                  <span class="info-text">{{ station.basicInfo.operatingHours }}</span>
                </div>
              </div>

              <div class="battery-info" @click="selectStation(station)">
                <div class="battery-stats">
                  <span class="stat-item">
                    <span class="stat-number">{{ station.operationStatus.availableCabinets }}</span>
                    <span class="stat-label">可用</span>
                  </span>
                  <span class="stat-item">
                    <span class="stat-number">{{ station.operationStatus.inUseCabinets }}</span>
                    <span class="stat-label">使用中</span>
                  </span>
                  <span class="stat-item">
                    <span class="stat-number">{{ station.operationStatus.totalBatteryCabinets }}</span>
                    <span class="stat-label">总数</span>
                  </span>
                </div>
                
                <div class="station-type">
                  <el-tag
                    size="small"
                    type="info"
                    class="type-tag"
                  >
                    {{ station.stationType }}
                  </el-tag>
                </div>
              </div>

              <div class="operation-info" @click="selectStation(station)">
                <div class="operation-stats">
                  <span class="operation-item">
                    <span class="operation-label">日换电次数</span>
                    <span class="operation-value">{{ station.operationStatus.dailySwapCount }}</span>
                  </span>
                  <span class="operation-item">
                    <span class="operation-label">平均换电时间</span>
                    <span class="operation-value">{{ station.operationStatus.averageSwapTime }}</span>
                  </span>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <!-- 编辑弹窗组件 -->
      <StationEditor
        ref="stationEditorRef"
        @station-updated="handleStationUpdated"
      />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineExpose, onMounted } from 'vue'
import { Menu, Search, Location, Phone, Clock, Delete, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllStations, deleteStation } from '@/utils/api/station-api'
import StationEditor from './StationEditor.vue'

// Props定义
const props = defineProps<{
  stations?: BatterySwapStation[]
}>()

// 换电站类型定义
type BatterySwapStation = {
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
  photos?: Array<{
    id: string
    filename: string
    path: string
    description: string
    uploadTime: string
    size: number
  }>
  serviceRadius?: number // 新增字段，兼容老数据
}

// 响应式数据
const visible = ref(false)
const searchKeyword = ref('')
const selectedDistrict = ref('')
const allStations = computed(() => props.stations || [])

const stationEditorRef = ref()
const editingStation = ref<BatterySwapStation | null>(null)

// 区县列表提取（兼容多种格式，去重）
const districts = computed(() => {
  const set = new Set<string>()
  allStations.value.forEach(station => {
    if (!station.address) return
    // 支持"昆明市五华区"、"云南省昆明市五华区"等
    const match = station.address.match(/(?:云南省)?昆明市([\u4e00-\u9fa5]+?)区/)
    if (match && match[1]) set.add(match[1] + '区')
  })
  return Array.from(set).sort()
})

// 过滤后的换电站列表
const filteredStations = computed(() => {
  let result = allStations.value
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase()
    result = result.filter(station =>
      station.name.toLowerCase().includes(kw) ||
      station.address.toLowerCase().includes(kw)
    )
  }
  if (selectedDistrict.value) {
    result = result.filter(station =>
      station.address && station.address.includes(selectedDistrict.value)
    )
  }
  return result
})

// 统计信息
const totalAvailableCabinets = computed(() =>
  filteredStations.value.reduce((sum, s) => sum + s.operationStatus.availableCabinets, 0)
)
const totalBatteryCabinets = computed(() =>
  filteredStations.value.reduce((sum, s) => sum + s.operationStatus.totalBatteryCabinets, 0)
)

// 事件
const emit = defineEmits<{ 
  'station-select': [any],
  'station-deleted': [string],
  'station-updated': [BatterySwapStation]
}>()

// 方法
const toggleSidebar = () => { 
  visible.value = !visible.value 
}

const handleClose = () => { 
  visible.value = false 
}

// 注意：数据现在通过props传递，不再需要自己加载

const handleSearch = (val: string) => { 
  searchKeyword.value = val 
}

const handleDistrictFilter = (val: string) => { 
  selectedDistrict.value = val 
}

const selectStation = (station: any) => { 
  emit('station-select', station) 
}

// 删除换电站方法
const handleDeleteStation = async (station: BatterySwapStation) => {
  try {
    // 构建确认消息
    let confirmMessage = `确定要删除换电站"${station.name}"吗？此操作不可恢复。`
    if (station.photos && station.photos.length > 0) {
      confirmMessage += `\n\n该换电站包含 ${station.photos.length} 张照片，删除后将同时删除所有照片文件。`
    }

    await ElMessageBox.confirm(
      confirmMessage,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const result = await deleteStation(station.id)
    
    if (result.success) {
      // 清除缓存以确保数据一致性
      localStorage.removeItem('stations_cache')
      
      // 从本地数据中移除
      const index = allStations.value.findIndex(s => s.id === station.id)
      if (index > -1) {
        allStations.value.splice(index, 1)
      }
      
      // 构建成功消息
      let successMessage = `换电站"${station.name}"已成功删除`
      if (result.deletedPhotos && result.deletedPhotos > 0) {
        successMessage += `，同时删除了 ${result.deletedPhotos} 张照片`
      }
      
      ElMessage.success(successMessage)
      
      // 触发父组件更新
      emit('station-deleted', station.id)
    } else {
      ElMessage.error('删除失败，请重试')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除换电站失败:', error)
      ElMessage.error('删除失败，请检查网络连接')
    }
  }
}

function handleEditStation(station: BatterySwapStation) {
  editingStation.value = station
  stationEditorRef.value?.showEditDialog(station)
}

function handleStationUpdated(updatedStation: BatterySwapStation) {
  // 更新本地数据
  const idx = allStations.value.findIndex(s => s.id === updatedStation.id)
  if (idx > -1) {
    // serviceRadius 兼容
    allStations.value[idx] = { ...updatedStation, serviceRadius: updatedStation.serviceRadius ?? 3.0 }
  }
  // 通知父组件更新数据
  emit('station-updated', updatedStation)
  ElMessage.success(`换电站"${updatedStation.name}"信息已更新`)
}

// 状态标签
const getStatusType = (status: string) => {
  switch (status) {
    case '运营中': return 'success'
    case '维护中': return 'warning'
    case '暂停服务': return 'danger'
    case '建设中': return 'info'
    default: return 'info'
  }
}

defineExpose({ toggleSidebar, visible })
</script>

<style lang="scss" scoped>
.sidebar-container {
  position: relative;
}

.sidebar-trigger {
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 2000;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .trigger-icon {
    color: white;
    font-size: 20px;
  }
}

// 自定义抽屉样式
:deep(.custom-drawer) {
  z-index: 2000 !important;

  .el-drawer__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    margin-bottom: 0;
    padding: 20px;

    .el-drawer__title {
      color: white;
      font-weight: 600;
    }

    .el-drawer__close-btn {
      color: white;
    }
  }

  .el-drawer__body {
    padding: 0;
    position: relative;
  }
}

.sidebar-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.search-section {
  margin-bottom: 20px;

  .search-input {
    width: 100%;
  }
}

.filter-section {
  margin-bottom: 20px;

  .filter-title {
    font-size: 14px;
    font-weight: 600;
    color: #606266;
    margin-bottom: 8px;
  }

  .district-select {
    width: 100%;
  }
}

.stats-section {
  margin-bottom: 20px;

  .stats-card {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border: none;

    .stats-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .stats-label {
        font-size: 14px;
        opacity: 0.9;
      }

      .stats-value {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

.station-list {
  flex: 1;
  overflow: hidden;

  .station-item {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .station-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      .station-name {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        flex: 1;
        margin-right: 8px;
        cursor: pointer;
      }

      .station-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .status-tag {
        flex-shrink: 0;
      }

      .edit-btn {
        flex-shrink: 0;
        opacity: 0.7;
        transition: all 0.3s ease;

        &:hover {
          opacity: 1;
          transform: scale(1.1);
        }
      }

      .delete-btn {
        flex-shrink: 0;
        opacity: 0.7;
        transition: all 0.3s ease;

        &:hover {
          opacity: 1;
          transform: scale(1.1);
        }
      }
    }

    .station-info {
      margin-bottom: 12px;
      cursor: pointer;

      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        font-size: 13px;
        color: #606266;

        .el-icon {
          margin-right: 6px;
          font-size: 14px;
        }

        .info-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .battery-info {
      margin-bottom: 12px;
      cursor: pointer;

      .battery-stats {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .stat-item {
          text-align: center;
          flex: 1;

          .stat-number {
            display: block;
            font-size: 18px;
            font-weight: 600;
            color: #409eff;
          }

          .stat-label {
            display: block;
            font-size: 12px;
            color: #909399;
            margin-top: 2px;
          }
        }
      }

      .station-type {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;

        .type-tag {
          font-size: 11px;
        }
      }
    }

    .operation-info {
      cursor: pointer;

      .operation-stats {
        display: flex;
        justify-content: space-between;
        background: #f8f9fa;
        padding: 8px;
        border-radius: 6px;

        .operation-item {
          text-align: center;
          flex: 1;

          .operation-label {
            display: block;
            font-size: 11px;
            color: #909399;
            margin-bottom: 2px;
          }

          .operation-value {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }
  }
}
</style>