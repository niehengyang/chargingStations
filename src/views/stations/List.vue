<template>
  <div class="classic-list-page">
    <div class="classic-list-header">
      <h2>换电站列表管理</h2>
      <div class="header-actions">
        <el-button type="default" @click="goHome" class="go-home-btn">返回首页</el-button>
        <el-button type="primary" @click="handleCreateStation" class="create-station-btn">
          <el-icon><Plus /></el-icon>
          创建站点
        </el-button>
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
    </div>

    <el-table
  :data="pagedStations"
  border
  stripe
  style="width: 100%"
  class="classic-table"
  header-cell-class-name="table-header"
  row-key="id"
>
      <el-table-column label="照片" min-width="80">
        <template #default="scope">
          <el-image
            v-if="scope.row.photos && scope.row.photos.length > 0"
            :src="getPhotoUrl(scope.row.photos[0])"
            :preview-src-list="scope.row.photos.map((p: any) => getPhotoUrl(p))"
            fit="cover"
            style="width: 48px; height: 48px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"
            :preview-teleported="true"
          />
          <div v-else class="no-photo">无</div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="120" />
      <el-table-column prop="stationType" label="类型" min-width="80" />
      <el-table-column prop="address" label="地址" min-width="180" />
      <el-table-column prop="province" label="省份" min-width="80" />
      <el-table-column prop="city" label="城市" min-width="80" />
      <el-table-column prop="district" label="区域" min-width="80" />
      <el-table-column prop="status" label="状态" min-width="80">
        <template #default="scope">
          <el-tag 
            :type="getStatusType(scope.row.status)"
            :class="scope.row.status === '存量' ? 'status-tag-存量' : ''"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="可用/总电池柜" min-width="120">
        <template #default="scope">
          <span>{{ getAvailableCabinets(scope.row) }}/{{ getTotalCabinets(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="basicInfo.contactPhone" label="联系电话" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.basicInfo.contactPhone }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="serviceRadius" label="服务半径(km)" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.serviceRadius }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="120" fixed="right">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            :icon="Edit"
            @click="handleEditStation(scope.row)"
            title="编辑"
            class="op-btn"
          />
          <el-button
            type="danger"
            size="small"
            icon="Delete"
            @click="handleDeleteStation(scope.row)"
            title="删除"
            class="op-btn"
          />
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <el-pagination
        background
        layout="prev, pager, next, jumper, ->, total"
        :total="filteredStations.length"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
        :page-sizes="[10, 20, 50]"
        @size-change="handlePageSizeChange"
        :pager-count="7"
      />
    </div>
    <!-- 站点编辑器组件 -->
    <StationEditor 
      ref="stationEditorRef" 
      @station-updated="handleStationUpdated"
    />
    <!-- 站点创建器组件 -->
    <StationCreator 
      v-model="showStationCreator" 
      ref="stationCreatorRef" 
      @station-created="handleStationCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted } from 'vue'
import StationEditor from '../../components/StationEditor.vue'
import StationCreator from '../../components/StationCreator.vue'

import { stationApiService, deleteStation } from '../../utils/api/station-api'
import { ENV_CONFIG } from '../../config/env'

function getPhotoUrl(photo: { path: string, filename: string }) {
  if (!photo) return ''
  if (photo.path) {
    // 使用API基础URL拼接照片路径
    const baseUrl = ENV_CONFIG.API_URL || 'http://localhost:3001'
    return `${baseUrl}${photo.path}`
  }
  return `${ENV_CONFIG.API_URL || 'http://localhost:3001'}/pictures/${photo.filename}`
}

function getTotalCabinets(station: BatterySwapStation): number {
  if (!station || !station.batteryCabinets) return 0;
  return station.batteryCabinets.length;
}

function getAvailableCabinets(station: BatterySwapStation): number {
  if (!station || !station.batteryCabinets) return 0;
  return station.batteryCabinets.filter(cabinet => cabinet.status === '可用').length;
}

type BatterySwapStation = {
  id: string
  name: string
  stationType: string
  coordinates: {
    latitude: number
    longitude: number
  }
  address: string
  province: string
  city: string
  district: string
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
  photos?: Array<{
    id: string
    filename: string
    path: string
    description: string
    uploadTime: string
    size: number
  }>
  serviceRadius?: number
}

const router = useRouter()
function goHome() {
  router.push('/')
}

const searchKeyword = ref('')
const selectedDistrict = ref('')
const allStations = ref<BatterySwapStation[]>([])
const loading = ref(false)
// 添加缺失的分页变量
const currentPage = ref(1)
const pageSize = ref(10)
// 添加缺失的编辑相关变量
const editingStation = ref<BatterySwapStation | null>(null)
const stationEditorRef = ref()
// 添加创建站点相关变量
const showStationCreator = ref(false)
const stationCreatorRef = ref()

// 恢复区县筛选计算属性
const districts = computed(() => {
  const set = new Set<string>()
  const stations = allStations.value || []
  stations.forEach(station => {
    if (!station.address) return
    const match = station.address.match(/(?:云南省)?昆明市([一-龥]+?)区/)
    if (match && match[1]) set.add(match[1] + '区')
  })
  return Array.from(set).sort()
})

// 添加筛选和分页计算属性
const filteredStations = computed(() => {
  let result = allStations.value || []
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

const pagedStations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStations.value?.slice(start, start + pageSize.value) || []
})

// 添加缺失的事件处理方法
const handleSearch = (val: string) => {
  searchKeyword.value = val
  currentPage.value = 1
}

const handleDistrictFilter = (val: string) => {
  selectedDistrict.value = val
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

// 新增数据获取方法
async function fetchStations() {
  try {
    loading.value = true
    console.log('开始获取换电站数据...')
    const response = await stationApiService.getAllStationsWithCache()
    console.log('API响应:', response)
    
    // 处理服务器返回的数据结构 {status, message, data}
    if (response.status === 0 && response.data) {
      allStations.value = response.data
      console.log('成功设置站点数据:', allStations.value)
    } else {
      // 如果响应格式不正确，尝试直接使用响应数据
      allStations.value = Array.isArray(response) ? response : []
      console.warn('API响应格式异常:', response)
    }
    console.log("获取换电站数据成功:", response)
  } catch (error) {
    // console.error('获取换电站数据失败:', error)
    ElMessage.error('获取换电站数据失败: ' + error.message)
    allStations.value = []
  } finally {
    loading.value = false
  }
}

// 添加生命周期钩子
onMounted(() => {
  // 清除可能存在的缓存
  localStorage.removeItem('stations_cache')
  // 强制刷新数据以获取最新排序
  fetchStations()
})

// 更新删除方法
const handleDeleteStation = async (station: BatterySwapStation) => {
  try {
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
      // 清除缓存以确保列表数据更新
      localStorage.removeItem('stations_cache')
      
      const index = allStations.value.findIndex(s => s.id === station.id)
      if (index > -1) {
        allStations.value.splice(index, 1)
      }
      let successMessage = `换电站"${station.name}"已成功删除`
      if (result.deletedPhotos && result.deletedPhotos > 0) {
        successMessage += `，同时删除了 ${result.deletedPhotos} 张照片`
      }
      ElMessage.success(successMessage)
    } else {
      ElMessage.error('删除失败，请重试')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请检查网络连接')
    }
  }
}

function handleEditStation(station: BatterySwapStation) {
  editingStation.value = station
  nextTick(() => {
    stationEditorRef.value?.showEditDialog(station)
  })
}

function handleStationUpdated(updatedStation: BatterySwapStation) {
  // 立即更新本地数据以提供即时反馈
  const idx = allStations.value.findIndex(s => s.id === updatedStation.id)
  if (idx > -1) {
    Object.assign(allStations.value[idx], updatedStation)
    if (allStations.value[idx].serviceRadius === undefined) {
      allStations.value[idx].serviceRadius = 3.0
    }
  }
  
  // 重新获取最新数据以确保数据一致性
  fetchStations()
  
  ElMessage.success(`换电站"${updatedStation.name}"信息已更新`)
  editingStation.value = null
}

// 处理创建站点按钮点击
function handleCreateStation() {
  showStationCreator.value = true
}

// 处理站点创建完成事件
function handleStationCreated(newStation: BatterySwapStation) {
  // 清除缓存以确保列表数据更新
  localStorage.removeItem('stations_cache')
  
  // 重新获取最新数据
  fetchStations()
  
  ElMessage.success(`换电站"${newStation.name}"创建成功`)
  showStationCreator.value = false
}

const getStatusType = (status: string) => {
  switch (status) {
    case '运营中': return 'success'
    case '维护中': return 'warning'
    case '暂停服务': return 'danger'
    case '建设中': return 'info'
    case '存量': return ''
    default: return 'info'
  }
}
</script>

<style lang="scss" scoped>
.classic-list-page {
  width: 100vw;
  height: 100vh;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.classic-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px 12px 32px;
  background: #fff;
  border-bottom: 1px solid #ececec;
  h2 {
    font-size: 22px;
    font-weight: 700;
    color: #333;
    margin: 0 16px 0 0;
  }
  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
    .search-input {
      width: 220px;
    }
    .district-select {
      width: 160px;
    }
    .go-home-btn {
      margin-right: 12px;
    }
    .create-station-btn {
      margin-right: 12px;
    }
  }
}

.classic-table {
  flex: 1;
  margin: 0 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-top: 24px;
  .el-image {
    cursor: pointer;
    transition: box-shadow 0.2s;
    &:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.13);
    }
  }
  .no-photo {
    color: #bbb;
    font-size: 13px;
    text-align: center;
  }
}

.table-header {
  background: #f5f7fa !important;
  color: #333;
  font-weight: 600;
  font-size: 15px;
}

.op-btn {
  margin-right: 6px;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 32px 24px 0;
  background: #fff;
  border-top: 1px solid #ececec;
  margin-top: 24px;
}

/* 存量自定义样式 */
:deep(.status-tag-存量) {
  background-color: #f3f0ff !important;
  border-color: #722ed1 !important;
  color: #722ed1 !important;
}
</style>