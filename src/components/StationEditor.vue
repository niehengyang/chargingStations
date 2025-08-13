<template>
    <div class="station-editor">
      <!-- 编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        title="编辑换电站"
        width="90%"
        max-width="1000px"
        :before-close="handleClose"
        :destroy-on-close="true"
        class="edit-station-dialog"
      >
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
           class="edit-form"
        >
          <!-- 基本信息 -->
          <el-card class="form-card">
            <template #header>
              <div class="card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>基本信息</span>
              </div>
            </template>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="站点名称" prop="name">
                  <el-input v-model="formData.name" placeholder="请输入换电站名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="站点类型" prop="stationType">
                  <el-select v-model="formData.stationType" placeholder="请选择站点类型" style="width: 100%">
                    <el-option label="电动自行车换电站" value="电动自行车换电站" />
                    <el-option label="电动汽车换电站" value="电动汽车换电站" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
  
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="归属单位" prop="basicInfo.owner">
                  <el-input v-model="formData.basicInfo.owner" placeholder="请输入归属单位" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="运营商" prop="basicInfo.operator">
                  <el-input v-model="formData.basicInfo.operator" placeholder="请输入运营商" />
                </el-form-item>
              </el-col>
            </el-row>
  
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系电话" prop="basicInfo.contactPhone">
                  <el-input v-model="formData.basicInfo.contactPhone" placeholder="请输入联系电话" />
                </el-form-item>
              </el-col>
            </el-row>
  
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="建立日期" prop="basicInfo.establishmentDate">
                  <el-date-picker
                    v-model="formData.basicInfo.establishmentDate"
                    type="date"
                    placeholder="选择建立日期"
                    style="width: 100%"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="运营状态" prop="status">
                  <el-select v-model="formData.status" placeholder="请选择运营状态" style="width: 100%">
                    <el-option label="运营中" value="运营中" />
                    <el-option label="维护中" value="维护中" />
                    <el-option label="暂停服务" value="暂停服务" />
                    <el-option label="建设中" value="建设中" />
                    <el-option label="存量" value="存量" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
  
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="省份" prop="province">
                  <el-select v-model="formData.province" placeholder="请选择省份" style="width: 100%">
                    <el-option label="云南省" value="云南省" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市" prop="city">
                  <el-select v-model="formData.city" placeholder="请选择城市" style="width: 100%">
                    <el-option v-for="cityItem in cities" :key="cityItem.city" :label="cityItem.city" :value="cityItem.city" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="区域" prop="district">
                  <el-select v-model="formData.district" placeholder="请选择区域" style="width: 100%">
                    <el-option v-for="district in districts" :key="district" :label="district" :value="district" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="详细地址" prop="address">
              <el-input v-model="formData.address" placeholder="请输入详细地址" />
            </el-form-item>
  
            <el-form-item label="站点描述" prop="description">
              <el-input 
                v-model="formData.description" 
                type="textarea" 
                :rows="3"
                placeholder="请输入站点描述" 
              />
            </el-form-item>

            <el-form-item label="服务半径(km)" prop="serviceRadius">
              <el-input 
                v-model.number="formData.serviceRadius" 
                type="number" 
                placeholder="请输入服务半径，单位：公里"
                :min="0.1" 
                :step="0.1" 
                :precision="1"
              />
            </el-form-item>
          </el-card>
  
          <!-- 位置信息 -->
          <el-card class="form-card">
            <template #header>
              <div class="card-header">
                <el-icon><Location /></el-icon>
                <span>位置信息</span>
              </div>
            </template>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="纬度" prop="coordinates.latitude">
                  <el-input 
                    v-model.number="formData.coordinates.latitude" 
                    type="number" 
                    placeholder="请输入纬度"
                    :precision="6"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="经度" prop="coordinates.longitude">
                  <el-input 
                    v-model.number="formData.coordinates.longitude" 
                    type="number" 
                    placeholder="请输入经度"
                    :precision="6"
                  />
                </el-form-item>
              </el-col>
            </el-row>
  
            <div class="map-picker">
              <MapPicker 
                v-model="selectedCoordinates"
                height="300px"
                :zoom="15"
                :center="[formData.coordinates.longitude, formData.coordinates.latitude]"
                @marker-selected="handleMarkerSelected"
                @marker-cleared="handleMarkerCleared"
              />
            </div>
          </el-card>
  
          
          
          <!-- 电池柜信息 -->
          <el-card class="form-card">
            <template #header>
              <div class="card-header">
                <el-icon><Box /></el-icon>
                <span>电池柜信息</span>
              </div>
            </template>
            
            <div class="battery-cabinets-section">
              <div class="cabinets-header">
                <span>电池柜列表</span>
                <el-button type="primary" size="small" @click="addBatteryCabinet">
                  <el-icon><Plus /></el-icon>
                  添加电池柜
                </el-button>
              </div>
              
              <div class="cabinets-list">
                <div 
                  v-for="(cabinet, index) in formData.batteryCabinets" 
                  :key="cabinet.cabinetId"
                  class="cabinet-item"
                >
                  <div class="cabinet-header">
                    <span>电池柜 {{ index + 1 }}</span>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeBatteryCabinet(index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item :label="`供应商`" :prop="`batteryCabinets.${index}.supplier`">
                        <el-input v-model="cabinet.supplier" placeholder="请输入供应商" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item :label="`电池数量`" :prop="`batteryCabinets.${index}.batteryCount`">
                        <el-input-number 
                          v-model="cabinet.batteryCount" 
                          :min="1" 
                          :max="100"
                          style="width: 100%"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item :label="`电池类型`" :prop="`batteryCabinets.${index}.batteryType`">
                        <el-select v-model="cabinet.batteryType" placeholder="请选择电池类型" style="width: 100%">
                          <el-option label="磷酸铁锂" value="磷酸铁锂" />
                          <el-option label="三元锂" value="三元锂" />
                          <el-option label="刀片电池" value="刀片电池" />
                          <el-option label="钠离子" value="钠离子" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item :label="`容量`" :prop="`batteryCabinets.${index}.capacity`">
                        <el-input v-model="cabinet.capacity" placeholder="如：60kWh" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item :label="`状态`" :prop="`batteryCabinets.${index}.status`">
                        <el-select v-model="cabinet.status" placeholder="请选择状态" style="width: 100%">
                          <el-option label="可用" value="可用" />
                          <el-option label="使用中" value="使用中" />
                          <el-option label="维护中" value="维护中" />
                          <el-option label="故障" value="故障" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </div>
          </el-card>
  
          <!-- 现有照片 -->
          <el-card class="form-card">
            <template #header>
              <div class="card-header">
                <el-icon><Picture /></el-icon>
                <span>现有照片</span>
              </div>
            </template>
            
            <div class="existing-photos">
              <div v-if="formData.photos && formData.photos.length > 0" class="photos-grid">
                <div 
                  v-for="photo in formData.photos" 
                  :key="photo.id"
                  class="photo-item"
                >
                  <el-image
                    :src="getPhotoUrl(photo)"
                    fit="cover"
                    class="photo-image"
                    :preview-src-list="[getPhotoUrl(photo)]"
                  />
                  <div class="photo-info">
                    <span class="photo-name">{{ photo.filename }}</span>
                    <span class="photo-size">{{ formatFileSize(photo.size) }}</span>
                  </div>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="removePhoto(photo.id)"
                    class="remove-photo-btn"
                    :style="{ backgroundColor: '#ff4d4f', opacity: 0.8 }"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div v-else class="no-photos">
                <el-empty description="暂无照片" />
              </div>
            </div>
          </el-card>
  
          <!-- 添加新照片 -->
          <el-card class="form-card">
            <template #header>
              <div class="card-header">
                <el-icon><Plus /></el-icon>
                <span>添加新照片</span>
              </div>
            </template>
            
            <div class="photo-upload-section">
              <el-upload
                ref="uploadRef"
                :action="uploadAction"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :file-list="fileList"
                list-type="picture-card"
                :limit="10"
                accept="image/*"
                class="photo-uploader"
              >
                <el-icon><Plus /></el-icon>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 jpg/png 文件，且不超过 5MB
                  </div>
                </template>
              </el-upload>
            </div>
          </el-card>
        </el-form>
  
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              保存修改
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>
  
<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, InfoFilled, Location, Tools, Service, Picture, MapLocation, Box, Delete } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile, UploadFiles } from 'element-plus'
import { updateStation, checkServerConnection, addPhotoToStation, deletePhotoFromStation } from '@/utils/api/index'
import type { BatterySwapStation, BatteryCabinet, Photo } from '@/types/charging-station'
import MapPicker from './MapPicker.vue'
import { validateImageFile, fileToBase64, compressImage, generateTempPhotoId, defaultUploadConfig, type PhotoData, savePhotoToLocalStorage, removePhotoFromLocalStorage, generatePhotoId, generatePhotoFilename, generatePhotoPath } from '@/utils/photo-utils'
import yunnanDistricts from '@/utils/yunnan-districts.json'
import { ENV_CONFIG } from '@/config/env'

// 响应式数据
interface CityInfo {
  city: string;
  districts: string[];
}
const cities = ref<CityInfo[]>([]);
const districts = ref<string[]>([]);



// 定义组件事件
const emit = defineEmits<{
  'station-updated': [station: BatterySwapStation]
}>()

// 响应式数据
const submitting = ref(false)
const dialogVisible = ref(false); 
const formRef = ref<FormInstance>()
const uploadRef = ref()
const fileList = ref<UploadFile[]>([])
const selectedCoordinates = ref<{ longitude: number; latitude: number } | null>(null)
const currentStation = ref<BatterySwapStation | null>(null)
const photosToDelete = ref<string[]>([]) // 存储要删除的照片ID

  // 表单数据
const formData = reactive({
  id: '',
  name: '',
  stationType: '电动自行车换电站',
  province: '',
  city: '',
  district: '',
  coordinates: {
    latitude: 25.000609,
    longitude: 102.716148
  },
  address: '',
  status: '运营中',
  serviceRadius: 3.0,
  basicInfo: {
    owner: '云南电网公司',
    operator: '昆明供电局',
    contactPhone: '',
    establishmentDate: new Date().toISOString().split('T')[0]
  },
  batteryCabinets: [] as BatteryCabinet[],
  description: '',
  photos: [] as Photo[]
})

// 监听省份变化加载城市列表
watch(() => formData.province, (province) => {
  if (province === '云南省') {
    const yunnan = yunnanDistricts;
    cities.value = yunnan ? yunnan.cities : []
    formData.city = ''
    districts.value = []
  }
})

// 监听城市变化加载区域列表
watch(() => formData.city, (city) => {
  if (city) {
    const selectedCity = yunnanDistricts.cities.find((item: { city: string }) => item.city === city)
    if (selectedCity) {
      districts.value = selectedCity.districts
      formData.district = ''
    }
  }
})
  
  // 表单验证规则
  const formRules = {
    name: [
    { required: true, message: '请输入换电站名称', trigger: 'blur' }
  ],
  province: [
    { required: true, message: '请选择省份', trigger: 'change' }
  ],
  city: [
    { required: true, message: '请选择城市', trigger: 'change' }
  ],
  district: [
    { required: true, message: '请选择区域', trigger: 'change' }
  ],
  stationType: [
    { required: true, message: '请选择站点类型', trigger: 'change' }
  ],
    coordinates: {
      latitude: [
        { required: true, message: '请输入纬度', trigger: 'blur' },
        { type: 'number', min: -90, max: 90, message: '纬度必须在-90到90之间', trigger: 'blur' }
      ],
      longitude: [
        { required: true, message: '请输入经度', trigger: 'blur' },
        { type: 'number', min: -180, max: 180, message: '经度必须在-180到180之间', trigger: 'blur' }
      ]
    },
    address: [
      { required: true, message: '请输入详细地址', trigger: 'blur' }
    ],
    status: [
      { required: true, message: '请选择运营状态', trigger: 'change' }
    ],
    basicInfo: {
      owner: [
        { required: true, message: '请输入归属单位', trigger: 'blur' }
      ],
      operator: [
        { required: true, message: '请输入运营商', trigger: 'blur' }
      ],
      contactPhone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' }
      ],
      establishmentDate: [
        { required: true, message: '请选择建立日期', trigger: 'change' }
      ]
    },
    description: [
      { required: true, message: '请输入站点描述', trigger: 'blur' }
    ]
  }
  
  // 方法
  const getPhotoUrl = (photo: { id?: string, path: string, filename: string }) => {
    if (!photo) return ''
    
    // 如果是临时照片（新上传但未保存的照片）
    if (photo.id && photo.id.startsWith('temp_')) {
      const tempPhotoKey = `photo_temp_${photo.id}`
      const tempPhotoData = localStorage.getItem(tempPhotoKey)
      if (tempPhotoData) {
        try {
          const photoInfo = JSON.parse(tempPhotoData)
          return photoInfo.base64Data || ''
        } catch (error) {
          console.error('解析临时照片数据失败:', error)
          return ''
        }
      }
      return ''
    }
    
    // 已保存的照片
    if (photo.path) {
      // 使用API基础URL拼接照片路径
      const baseUrl = ENV_CONFIG.API_URL || 'http://localhost:3001'
      return `${baseUrl}${photo.path}`
    }
    return `${ENV_CONFIG.API_URL || 'http://localhost:3001'}/pictures/${photo.filename}`
  }

  const showEditDialog = (station: BatterySwapStation) => {
    currentStation.value = station
    dialogVisible.value = true
    loadStationData(station)
  }
  
  const loadStationData = async (station: BatterySwapStation) => {
    // 清空表单
    Object.assign(formData, {
      id: station.id,
      name: station.name,
      stationType: station.stationType,
      coordinates: { ...station.coordinates },
      address: station.address,
      status: station.status,
      serviceRadius: station.serviceRadius || 3.0,
      basicInfo: { ...station.basicInfo },
      batteryCabinets: [...(station.batteryCabinets || [])],
      description: station.description,
      photos: [...(station.photos || [])]
    })

    // 分步设置省市区，确保监听器正确触发
    formData.province = station.province;
    await nextTick();
    formData.city = station.city;
    await nextTick();
    formData.district = station.district;
    
    selectedCoordinates.value = { 
      longitude: station.coordinates.longitude, 
      latitude: station.coordinates.latitude 
    }
  }
  
  // 上传配置
  const uploadAction = '#'
  
  // 文件处理方法
  const handleFileChange = async (file: UploadFile, fileList: UploadFiles) => {
    if (!file.raw) {
      ElMessage.error('文件读取失败')
      return false
    }
  
    // 验证文件
    const validation = validateImageFile(file.raw)
    if (!validation.isValid) {
      ElMessage.error(validation.error || '文件验证失败')
      return false
    }
  
    try {
      // 转换为 base64
      const base64Data = await fileToBase64(file.raw)
      
      // 压缩图片
      const compressedBase64 = await compressImage(
        base64Data, 
        defaultUploadConfig.maxWidth, 
        defaultUploadConfig.maxHeight, 
        defaultUploadConfig.quality
      )
  
          // 创建照片数据对象，使用临时ID
    const photoData: Photo = {
      id: generateTempPhotoId(),
      filename: file.name,
      path: '', // 临时路径，创建换电站后会更新
      description: `照片 - ${file.name}`,
      uploadTime: new Date().toISOString(),
      size: file.raw.size
    }
  
      // 将压缩后的 base64 数据存储到临时位置
      const tempPhotoKey = `photo_temp_${photoData.id}`
      const tempPhotoInfo = {
        ...photoData,
        base64Data: compressedBase64
      }
      localStorage.setItem(tempPhotoKey, JSON.stringify(tempPhotoInfo))
  
      // 添加到表单数据
      formData.photos.push(photoData)
      
      ElMessage.success('照片上传成功')
    } catch (error) {
      console.error('文件处理失败:', error)
      ElMessage.error('文件处理失败，请重试')
      return false
    }
  }
  
  const handleFileRemove = (file: UploadFile) => {
    const index = formData.photos.findIndex((photo: { filename: string }) => photo.filename === file.name)
    if (index > -1) {
      const removedPhoto = formData.photos[index]
      
      // 删除临时存储的照片数据
      const tempPhotoKey = `photo_temp_${removedPhoto.id}`
      localStorage.removeItem(tempPhotoKey)
      
      formData.photos.splice(index, 1)
    }
  }
  
  const removePhoto = (photoId: string) => {
    const photo = formData.photos.find((p: { id: string }) => p.id === photoId)
    if (!photo) {
      ElMessage.error('照片不存在')
      return
    }

    // 如果是临时照片（新上传但未保存的照片）
    if (photoId.startsWith('temp_')) {
      // 删除本地存储的临时照片数据
      const tempPhotoKey = `photo_temp_${photoId}`
      localStorage.removeItem(tempPhotoKey)
      
      // 从表单数据中移除
      const index = formData.photos.findIndex((p: { id: string }) => p.id === photoId)
      if (index > -1) {
        formData.photos.splice(index, 1)
      }
      return
    }

    // 如果是已保存的照片，只从界面移除并标记为待删除
    const index = formData.photos.findIndex((p: { id: string }) => p.id === photoId)
    if (index > -1) {
      formData.photos.splice(index, 1)
      // 添加到待删除列表
      if (!photosToDelete.value.includes(photoId)) {
        photosToDelete.value.push(photoId)
      }
    }
  }
  
  const handleClose = () => {
    dialogVisible.value = false
    resetForm()
  }
  
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
    fileList.value = []
    formData.photos = []
    formData.batteryCabinets = []
    currentStation.value = null
    photosToDelete.value = [] // 清空待删除照片列表
  }
  
  const addBatteryCabinet = () => {
    const newCabinet: BatteryCabinet = {
      cabinetId: generatePhotoId('station_'+stationId.value),
      supplier: '',
      batteryCount: 10,
      batteryType: '磷酸铁锂',
      capacity: '60kWh',
      status: '可用'
    }
    formData.batteryCabinets.push(newCabinet)
  }
  
  const removeBatteryCabinet = (index: number) => {
    formData.batteryCabinets.splice(index, 1)
  }
  
  // 地图标记相关方法
  const handleMarkerSelected = (coordinates: { longitude: number; latitude: number }) => {
    formData.coordinates.longitude = coordinates.longitude
    formData.coordinates.latitude = coordinates.latitude
    selectedCoordinates.value = coordinates
  }
  
  const handleMarkerCleared = () => {
    selectedCoordinates.value = null
  }
  
  const validateForm = async (): Promise<boolean> => {
    if (!formRef.value) return false
    
    try {
      await formRef.value.validate()
      return true
    } catch (error) {
      return false
    }
  }
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  const handleSubmit = async () => {
    // 验证表单
    const isValid = await validateForm()
    if (!isValid) {
      ElMessage.error('请检查表单填写是否正确')
      return
    }

    submitting.value = true

    try {
      // 检查服务器连接
      const isServerConnected = await checkServerConnection()
      if (!isServerConnected) {
        ElMessage.error('无法连接到服务器，请确保后端服务正在运行')
        return
      }

      // 基本数据验证
      if (!formData.name || !formData.address) {
        ElMessage.error('请填写必要的站点信息')
        return
      }

      // 更新换电站（不包含新照片，新照片通过单独接口添加）
      const stationDataToUpdate = {
        ...formData,
        photos: formData.photos.filter((photo: { id: string }) => !photo.id.startsWith('temp_')) // 只保留已存在的照片
      }
      const updatedStation = await updateStation(formData.id, stationDataToUpdate)

      // 处理待删除的照片
      if (photosToDelete.value.length > 0) {
        // 过滤掉可能不存在的照片ID（防止重复删除）
        const validPhotosToDelete = photosToDelete.value.filter(photoId => {
          // 检查原始站点数据中是否存在该照片
          return currentStation.value?.photos?.some((photo: { id: string }) => photo.id === photoId)
        })
        
        if (validPhotosToDelete.length === 0) {
           photosToDelete.value = []
         } else {
          let deletedCount = 0
          let failedCount = 0
          
          for (const photoId of validPhotosToDelete) {
            try {
              const result = await deletePhotoFromStation(updatedStation.id, photoId)
              
              // 检查删除结果
              if (result && result.status === 0) {
                deletedCount++
                if (result.warning) {
                  // 照片记录删除成功但文件删除失败
                  console.warn(`照片 ${photoId} 记录删除成功，但文件删除失败: ${result.warning}`)
                }
              }
            } catch (error) {
              console.error(`删除照片 ${photoId} 失败:`, error)
              
              // 检查是否是404错误（照片不存在）
              if (error.response?.status === 404) {
                // 照片不存在，但这不算失败，因为目标已经达到（照片不存在了）
                deletedCount++
                console.warn(`照片 ${photoId} 不存在，可能已被删除`)
              } else {
                // 其他错误才算真正的失败
                failedCount++
                const errorMessage = error.response?.data?.message || error.message || '未知错误'
                console.error(`照片 ${photoId} 删除失败: ${errorMessage}`)
              }
            }
          }
          
          // 根据删除结果显示消息
          if (failedCount === 0) {
            // 删除成功
          } else {
            ElMessage.warning(`${failedCount} 张照片删除失败，${deletedCount} 张照片删除成功`)
          }
          
          // 清空待删除列表
          photosToDelete.value = []
        }
      }

      // 处理新上传的照片
      const newPhotos = formData.photos.filter((photo: { id: string }) => photo.id.startsWith('temp_'))
      if (newPhotos.length > 0) {
        for (const tempPhoto of newPhotos) {
          try {
            // 从本地存储获取照片数据
            const photoData = localStorage.getItem(`photo_temp_${tempPhoto.id}`)
            if (photoData) {
              const photoInfo = JSON.parse(photoData) as PhotoData
              
              // 生成正式的照片ID和文件名
              const photoId = generatePhotoId(updatedStation.id, (updatedStation.photos || []) as PhotoData[])
              const filename = generatePhotoFilename(photoInfo.filename, photoId)
              const path = generatePhotoPath(updatedStation.id, filename)
              
              // 创建照片数据对象
              const photoDataToUpload = {
                id: photoId,
                filename: filename,
                path: path,
                description: photoInfo.description || tempPhoto.description,
                uploadTime: photoInfo.uploadTime || tempPhoto.uploadTime,
                size: photoInfo.size || tempPhoto.size,
                base64Data: photoInfo.base64Data!
              }
              
              // 上传照片到服务器
              await addPhotoToStation(updatedStation.id, photoDataToUpload)
            }
          } catch (error) {
            console.error(`上传照片失败: ${tempPhoto.filename}`, error)
            ElMessage.warning(`照片 ${tempPhoto.filename} 上传失败，但换电站已更新成功`)
          }
        }
      }

      // 清理所有临时照片缓存数据
      const allTempPhotos = formData.photos.filter((photo: { id: string }) => photo.id.startsWith('temp_'))
      allTempPhotos.forEach((tempPhoto: { id: any }) => {
        removePhotoFromLocalStorage(tempPhoto.id)
      })

      // 清除缓存以确保列表数据更新
      localStorage.removeItem('stations_cache')
      
      ElMessage.success('换电站更新成功!')
      emit('station-updated', updatedStation)
      handleClose()
    } catch (error) {
      console.error('更新换电站失败:', error)
      ElMessage.error(`更新换电站失败: ${error instanceof Error ? error.message : '请重试'}`)
    } finally {
      submitting.value = false
    }
  }

  // 暴露方法给父组件
  defineExpose({
    showEditDialog
  })
</script>

<style lang="scss" scoped>
.station-editor {
  .edit-station-dialog {
    .edit-form {
      max-height: 70vh;
      overflow-y: auto;
      padding: 0 20px;
    }

    .form-card {
      margin-bottom: 20px;

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }
    }

    .map-picker {
      width: 100%;
      margin-top: 20px;
      height: 400px;
    }

    .battery-cabinets-section {
      .cabinets-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
      }

      .cabinets-list {
        .cabinet-item {
          border: 1px solid #ebeef5;
          border-radius: 4px;
          padding: 20px;
          margin-bottom: 20px;
          background-color: #fafafa;

          .cabinet-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ebeef5;
            font-weight: 600;
          }
        }
      }
    }

    .existing-photos {
      .photos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;

        .photo-item {
          position: relative;
          border: 1px solid #ebeef5;
          border-radius: 8px;
          overflow: hidden;
          background-color: #fafafa;

          .photo-image {
            width: 100%;
            height: 150px;
            object-fit: cover;
          }

          .photo-info {
            padding: 10px;
            background-color: #fff;

            .photo-name {
              display: block;
              font-size: 14px;
              font-weight: 500;
              color: #333;
              margin-bottom: 5px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .photo-size {
              display: block;
              font-size: 12px;
              color: #999;
            }
          }

          .remove-photo-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: rgba(255, 255, 255, 0.9);
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        }
      }

      .no-photos {
        text-align: center;
        padding: 40px 0;
      }
    }

    .photo-upload-section {
      .photo-uploader {
        :deep(.el-upload--picture-card) {
          width: 100px;
          height: 100px;
          line-height: 100px;
        }
      }
    }

    .dialog-footer {
      text-align: right;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .edit-station-dialog {
    width: 95% !important;
    max-width: none !important;

    .edit-form {
      padding: 0 10px;
    }

    .el-form-item {
      margin-bottom: 15px;
    }

    .existing-photos {
      .photos-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
      }
    }
  }
}
</style>