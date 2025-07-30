// 照片处理工具函数

export interface PhotoData {
  id: string
  filename: string
  path: string
  description: string
  uploadTime: string
  size: number
  base64Data?: string
}

export const defaultUploadConfig = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  maxSize: 5 * 1024 * 1024 // 5MB
}

// 验证图片文件
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: '请选择文件' }
  }
  
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: '请选择图片文件' }
  }
  
  if (file.size > defaultUploadConfig.maxSize) {
    return { isValid: false, error: '文件大小不能超过5MB' }
  }
  
  return { isValid: true }
}

// 文件转base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 压缩图片
export const compressImage = (
  base64: string,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      const { width, height } = img
      let { width: newWidth, height: newHeight } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        newWidth = width * ratio
        newHeight = height * ratio
      }
      
      canvas.width = newWidth
      canvas.height = newHeight
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    
    img.src = base64
  })
}

// 生成临时照片ID
export const generateTempPhotoId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 生成照片ID
export const generatePhotoId = (stationId: string, existingPhotos: PhotoData[]): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 6)
  return `${stationId}_${timestamp}_${random}`
}

// 生成照片文件名
export const generatePhotoFilename = (originalFilename: string, photoId: string): string => {
  const ext = originalFilename.split('.').pop() || 'jpg'
  return `${photoId}.${ext}`
}

// 生成照片路径
export const generatePhotoPath = (stationId: string, filename: string): string => {
  return `/pictures/${stationId}/${filename}`
}

// 保存照片到本地存储
export const savePhotoToLocalStorage = (photoId: string, photoData: PhotoData): void => {
  try {
    localStorage.setItem(`photo_temp_${photoId}`, JSON.stringify(photoData))
  } catch (error) {
    console.error('保存照片到本地存储失败:', error)
  }
}

// 从本地存储移除照片
export const removePhotoFromLocalStorage = (photoId: string): void => {
  try {
    localStorage.removeItem(`photo_temp_${photoId}`)
  } catch (error) {
    console.error('从本地存储移除照片失败:', error)
  }
}

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}