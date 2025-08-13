<template>
  <div class="route-planner">
    <div class="route-planner-header">
      <span class="route-planner-title">路线规划</span>
      <el-button 
        type="text" 
        class="close-button" 
        @click="handleClose"
        :icon="Close"
        size="small"
      />
    </div>
    <el-form :inline="true" class="route-form">
      <el-form-item label="起点">
        <el-select v-model="startStationId" placeholder="选择起点" style="width: 220px" placement="top-start">
          <el-option
            v-for="station in (stations.length > 1 ? stations.filter((s: any) => s.id !== endStationId) : stations)"
            :key="station.id"
            :label="station.name"
            :value="String(station.id)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="终点">
        <el-select v-model="endStationId" placeholder="选择终点" style="width: 220px" placement="top-start">
          <el-option
            v-for="station in (stations.length > 1 ? stations.filter((s: any) => s.id !== startStationId) : stations)"
            :key="station.id"
            :label="station.name"
            :value="String(station.id)"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="!canPlanRoute" @click="planRoute">规划路线</el-button>
      </el-form-item>
    </el-form>

    <div id="panel"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { getAllStations } from "@/utils/api/station-api";
import type { BatterySwapStation } from '@/types/charging-station'

// 父组件传入地图实例
const props = defineProps<{ map: any }>()

// 定义事件
const emit = defineEmits(['close'])

const stations = ref<BatterySwapStation[]>([])

onMounted(async () => {
  try {
    const response = await getAllStations()
    if (response.status === 0 && response.data) {
      stations.value = response.data
    }
  } catch (error) {
    console.error('获取站点数据失败:', error)
  }
})

const startStationId = ref<string>('')
const endStationId = ref<string>('')
const driving = ref<any>(null)

const canPlanRoute = computed(() =>
  startStationId.value !== '' &&
  endStationId.value !== '' &&
  startStationId.value !== endStationId.value
)

// 监听路线规划参数变化
watch([startStationId, endStationId, canPlanRoute], ([start, end, can]) => {
  // 路线规划参数已更新
})

// 路线规划
const planRoute = () => {
  if (!props.map || !canPlanRoute.value) return
  const AMap = (window as any).AMap
  const start = stations.value.find((s: any) => s.id === startStationId.value)
  const end = stations.value.find((s: any) => s.id === endStationId.value)
  if (!start || !end) return

  // 清除上一次规划
  if (driving.value) {
    driving.value.clear()
  }

  props.map.plugin('AMap.Riding', function () {
    driving.value = new AMap.Riding({
      policy: 2,
      map: props.map,
      panel: 'panel',
      autoFitView: false
    })
    const startLngLat = [start.coordinates.longitude, start.coordinates.latitude]
    const endLngLat = [end.coordinates.longitude, end.coordinates.latitude]
    driving.value.search(startLngLat, endLngLat, function (status: any, result: any) {
      // 可在此处理结果
      // status: complete/no_data/error
    })
  })
}

// 关闭组件
const handleClose = () => {
  // 清除路线规划
  if (driving.value) {
    driving.value.clear()
  }
  emit('close')
}
</script>

<style lang="scss" scoped>
.route-planner {
    padding: 16px 0;
    position: relative;
  }

.route-planner-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 4px;
  }

.route-planner-title {
    font-size: 16px;
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

.route-form {
    display: flex;
    align-items: center;
    gap: 16px;
  }

#panel {
    position: fixed;
    background-color: white;
    max-height: 90%;
    overflow-y: auto;
    top: 100px;
    right: 20px;
    width: 280px;
    z-index: 100;
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}
#panel .amap-call {
    background-color: #009cf9;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}
#panel .amap-lib-walking {
  border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    overflow: hidden;
}
</style>
