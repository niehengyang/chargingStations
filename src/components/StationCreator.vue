<template>
  <div class="station-creator">
    <!-- 创建对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建新换电站"
      width="60%"
      max-width="800px"
      :before-close="handleClose"
      :destroy-on-close="true"
      class="create-station-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="create-form"
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
                  <el-option v-for="(cityItem, index) in cities" :key="index" :label="cityItem.name" :value="cityItem.name" />
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
          <el-form-item label="服务半径(公里)" prop="serviceRadius">
            <el-input-number v-model="formData.serviceRadius" :min="0" :max="20" :step="0.1" placeholder="请输入服务半径" />
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
                :key="index"
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
                    <el-form-item :label="`电池柜ID`" :prop="`batteryCabinets.${index}.cabinetId`">
                      <el-input v-model="cabinet.cabinetId" placeholder="请输入电池柜ID" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`供应商`" :prop="`batteryCabinets.${index}.supplier`">
                      <el-input v-model="cabinet.supplier" placeholder="请输入供应商" />
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
                    <el-form-item :label="`容量`" :prop="`batteryCabinets.${index}.capacity`">
                      <el-input v-model="cabinet.capacity" placeholder="如：60kWh" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
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

        <!-- 照片上传 -->
        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <el-icon><Picture /></el-icon>
              <span>站点照片</span>
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
            创建换电站
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, InfoFilled, Location, Tools, Service, Picture, MapLocation, Box, Delete } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile, UploadFiles } from 'element-plus'
import { createStation, checkServerConnection, addPhotoToStation } from '@/utils/api/station-api'
import type { BatterySwapStation, BatteryCabinet, Photo } from '@/types/charging-station'
import MapPicker from './MapPicker.vue'
import { validateImageFile, fileToBase64, compressImage, generateTempPhotoId, defaultUploadConfig, type PhotoData, savePhotoToLocalStorage, removePhotoFromLocalStorage, generatePhotoId, generatePhotoFilename, generatePhotoPath } from '@/utils/photo-utils'
import yunnanDistricts from '@/utils/yunnan-districts.json'

// 添加双向绑定属性
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// 更新emit定义
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'station-created': [station: BatterySwapStation]
}>()

// 响应式数据
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const uploadRef = ref()
const fileList = ref<UploadFile[]>([])
const selectedCoordinates = ref<{ longitude: number; latitude: number } | null>(null)
const cities = ref([])
const districts = ref([])

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
})

watch(dialogVisible, (newValue) => {
  emit('update:modelValue', newValue)
})

// 表单数据
const formData = reactive({
  province: '',
  city: '',
  district: '',
  name: '',
  stationType: '电动自行车换电站',
  coordinates: {
    latitude: 25.000609,
    longitude: 102.716148
  },
  address: '',
  status: '运营中',
  serviceRadius: 3.0, // 服务辐射范围（公里）
  basicInfo: {
    owner: '云南电网公司',
    operator: '昆明供电局',
    contactPhone: '',
    operatingHours: '24小时',
    establishmentDate: new Date().toISOString().split('T')[0]
  },
  batteryCabinets: [] as BatteryCabinet[],
  description: '',
  photos: []
})

// 监听省份变化加载城市列表
watch(() => formData.province, (province) => {
  if (province === '云南省') {
    // 增强数据加载逻辑，支持多种JSON结构

// 尝试多种数据结构访问方式
let yunnanProvince = null;
let citiesData = [];

// 结构1: { provinces: [{ name: '云南省', cities: [...] }, ...] }
if (yunnanDistricts?.provinces) {
  yunnanProvince = yunnanDistricts.provinces.find(prov => prov.name === '云南省');
  citiesData = yunnanProvince?.cities || [];
}
// 结构2: { cities: [{ name: '昆明市', ... }, ...] } (直接城市数组)
else if (yunnanDistricts?.cities) {
  citiesData = yunnanDistricts.cities;
}
// 结构3: [{ name: '昆明市', ... }, ...] (顶级城市数组)
else if (Array.isArray(yunnanDistricts)) {
  citiesData = yunnanDistricts;
}

cities.value = citiesData;

// 标准化城市数据格式
cities.value = cities.value.map(city => ({
  name: city.name || city.city || 'Unnamed City',
  districts: city.districts || city.areas || []
}));
    formData.city = ''
    districts.value = []
  }
})

// 监听城市变化加载区域列表
watch(() => formData.city, (city) => {
  if (city) {
    // 增强城市查找逻辑
const selectedCity = cities.value?.find(cityItem => 
  cityItem.name === city || cityItem.city === city
);

// 标准化区域数据
if (selectedCity) {
  // 支持多种区域属性名
  const districtData = selectedCity.districts || selectedCity.areas || selectedCity.regions || [];
  // 标准化区域格式
  districts.value = districtData.map(district => district.name || district.district || district);
} else {
  console.warn('No districts found for city:', city);
  districts.value = [];
}
    if (selectedCity) {
      districts.value = selectedCity.districts
      formData.district = ''
    }
  }
})

// 表单验证规则
const formRules = {
  name: [
      { required: true, message: '请输入站点名称', trigger: 'blur' }
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
  const index = formData.photos.findIndex(photo => photo.filename === file.name)
  if (index > -1) {
    const removedPhoto = formData.photos[index]
    
    // 删除临时存储的照片数据
    const tempPhotoKey = `photo_temp_${removedPhoto.id}`
    localStorage.removeItem(tempPhotoKey)
    formData.photos.splice(index, 1)
    ElMessage.success('照片已移除')
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
}

const addBatteryCabinet = () => {
  const newCabinet: BatteryCabinet = {
    cabinetId: `CAB${Date.now()}`,
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

    // 创建换电站数据（先不包含照片，等创建成功后再处理照片）
    const newStation = {
      ...formData,
      photos: [] // 先清空照片，等创建成功后再添加
    }

    // 基本数据验证
    if (!newStation.name || !newStation.address || !newStation.coordinates) {
      ElMessage.error('请填写完整的站点信息')
      return
    }

    // 创建换电站
    const createdStation = await createStation(newStation)

    // 处理照片上传
    if (formData.photos.length > 0) {
      for (const tempPhoto of formData.photos) {
        try {
          // 从本地存储获取照片数据
          const photoData = localStorage.getItem(`photo_temp_${tempPhoto.id}`)
          if (photoData) {
            const photoInfo = JSON.parse(photoData) as PhotoData
            
            // 生成正式的照片ID和文件名
            const photoId = generatePhotoId(createdStation.id, (createdStation.photos || []) as PhotoData[])
            const filename = generatePhotoFilename(tempPhoto.filename, photoId)
            const path = generatePhotoPath(createdStation.id, filename)
            
            // 创建照片数据对象
            const photoDataToUpload = {
              id: photoId,
              filename: filename,
              path: path,
              description: tempPhoto.description,
              uploadTime: tempPhoto.uploadTime,
              size: tempPhoto.size,
              base64Data: photoInfo.base64Data!
            }
            
            // 上传照片到服务器
            await addPhotoToStation(createdStation.id, photoDataToUpload)
            
            // 清理临时存储
            localStorage.removeItem(`photo_temp_${tempPhoto.id}`)
          }
        } catch (error) {
          console.error(`上传照片失败: ${tempPhoto.filename}`, error)
          ElMessage.warning(`照片 ${tempPhoto.filename} 上传失败，但换电站已创建成功`)
        }
      }
    }

    // 清除缓存以确保列表数据更新
    localStorage.removeItem('stations_cache')
    
    ElMessage.success('换电站创建成功!')
    emit('station-created', createdStation)
    handleClose()
  } catch (error) {
    console.error('创建换电站失败:', error)
    ElMessage.error(`创建换电站失败: ${error instanceof Error ? error.message : '请重试'}`)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-station-dialog {
  .create-form {
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

// 响应式设计
@media (max-width: 768px) {
  .create-station-dialog {
    width: 95% !important;
    max-width: none !important;

    .create-form {
      padding: 0 10px;
    }

    .el-form-item {
      margin-bottom: 15px;
    }
  }
}
</style>
