import { readData, saveData } from '../utils/dataHandler.js';
import { DATA_DIR, DB_FILE } from '../config/env.js';
import path from 'path';
import fs from 'fs';
import { log } from '../utils/logger.js';

const STATIONS_FILE = path.join(DATA_DIR, DB_FILE);

// 生成新站点ID
export const generateStationId = (stations) => {
  if (stations.length === 0) return 'BSS001';
  
  // 提取所有ID并找到最大的数字部分
  const ids = stations.map(s => s.id.replace('BSS', '')).map(Number);
  const maxId = Math.max(...ids);
  const newId = maxId + 1;
  
  // 格式化为3位数字
  return `BSS${String(newId).padStart(3, '0')}`;
};

// 生成照片ID
export const generatePhotoId = (stationId, photos) => {
  if (!photos || photos.length === 0) return `${stationId}_001`;
  
  // 提取所有照片ID并找到最大的数字部分
  const photoIds = photos.map(p => p.id.split('_')[1]).map(Number);
  const maxPhotoId = Math.max(...photoIds);
  const newPhotoId = maxPhotoId + 1;
  
  // 格式化为3位数字
  return `${stationId}_${String(newPhotoId).padStart(3, '0')}`;
};

// 生成电池柜ID
export const generateCabinetId = (stationId, cabinets) => {
  if (!cabinets || cabinets.length === 0) return `${stationId}_CAB001`;
  
  // 提取所有电池柜ID并找到最大的数字部分
  const cabinetIds = cabinets.map(c => c.cabinetId.split('_CAB')[1]).map(Number);
  const maxCabinetId = Math.max(...cabinetIds);
  const newCabinetId = maxCabinetId + 1;
  
  // 格式化为3位数字
  return `${stationId}_CAB${String(newCabinetId).padStart(3, '0')}`;
};

export const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
};

// 获取所有站点
export const getAllStations = (req, res) => {
  try {
    const data = readData(STATIONS_FILE);
    res.json({
      status: 0,
      message: '获取成功',
      data: data.batterySwapStations
    });
  } catch (error) {
    log('error', `获取站点列表失败: ${error.message}`);
    res.status(500).json({
      status: 1,
      message: '获取站点列表失败',
      error: error.message
    });
  }
};

// 获取单个站点
export const getStationById = (req, res) => {
  try {
    const { id } = req.params;
    const data = readData(STATIONS_FILE);
    const station = data.batterySwapStations.find(s => s.id === id);
    
    if (!station) {
      return res.status(404).json({
        status: 1,
        message: '站点不存在'
      });
    }
    
    res.json({
      status: 0,
      message: '获取成功',
      data: station
    });
  } catch (error) {
    log('error', `获取站点详情失败: ${error.message}`);
    res.status(500).json({
      status: 1,
      message: '获取站点详情失败',
      error: error.message
    });
  }
};

// 创建站点
export const createStation = (req, res) => {
  try {
    const stationData = req.body;
    const data = readData(STATIONS_FILE);
    const stations = data.batterySwapStations;
    
    // 基本验证
    if (!stationData.name || !stationData.coordinates) {
      return res.status(400).json({
        status: 1,
        message: '站点名称和坐标为必填项'
      });
    }
    
    if (!stationData.coordinates.latitude || !stationData.coordinates.longitude) {
      return res.status(400).json({
        status: 1,
        message: '坐标必须包含纬度和经度信息'
      });
    }
    
    // 自动生成站点ID
    const stationId = generateStationId(stations);
    
    // 添加新站点
    const stationWithId = {
        ...stationData,
        id: stationId
    };

    // 添加新站点
    data.batterySwapStations.push(stationWithId);
    
    // 更新metadata
    data.metadata.totalStations = data.batterySwapStations.length;
    data.metadata.lastUpdated = new Date().toISOString();
    
    // 保存数据
    const saved = saveData(data, STATIONS_FILE);
    if (!saved) {
      return res.status(500).json({
        status: 1,
        message: '保存站点数据失败'
      });
    }
    
    res.status(201).json({
      status: 0,
      message: '站点创建成功',
      data: stationWithId
    });
  } catch (error) {
    log('error', `创建站点失败: ${error.message}`);
    res.status(500).json({
      status: 1,
      message: '创建站点失败',
      error: error.message
    });
  }
};

// 更新站点
export const updateStation = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const data = readData(STATIONS_FILE);
    
    const index = data.batterySwapStations.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({
        status: 1,
        message: '站点不存在'
      });
    }
    
    // 更新站点数据
    data.batterySwapStations[index] = { ...data.batterySwapStations[index], ...updates };
    
    // 更新metadata
    data.metadata.lastUpdated = new Date().toISOString();
    
    // 保存数据
    const saved = saveData(data, STATIONS_FILE);
    if (!saved) {
      return res.status(500).json({
        status: 1,
        message: '保存站点数据失败'
      });
    }
    
    res.json({
      status: 0,
      message: '站点更新成功',
      data: data.batterySwapStations[index]
    });
  } catch (error) {
    log('error', `更新站点失败: ${error.message}`);
    res.status(500).json({
      status: 1,
      message: '更新站点失败',
      error: error.message
    });
  }
};

// 删除站点
export const deleteStation = (req, res) => {
  try {
    const { id } = req.params;
    const data = readData(STATIONS_FILE);
    
    // 找到要删除的站点
    const stationIndex = data.batterySwapStations.findIndex(s => s.id === id);
    
    if (stationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '站点不存在'
      });
    }
    
    const station = data.batterySwapStations[stationIndex];
    let deletedPhotos = 0;
    
    // 删除站点照片文件夹（包含所有照片文件）
    try {
      const stationPhotoDir = path.join(DATA_DIR, 'pictures', id);
      if (fs.existsSync(stationPhotoDir)) {
        // 递归删除整个站点照片目录及其所有内容
        fs.rmSync(stationPhotoDir, { recursive: true, force: true });
        deletedPhotos = station.photos ? station.photos.length : 0;
        log('info', `成功删除站点照片目录: ${stationPhotoDir}，删除了 ${deletedPhotos} 张照片`);
      } else {
        log('info', `站点照片目录不存在: ${stationPhotoDir}`);
      }
    } catch (dirError) {
      log('error', `删除站点照片目录失败: ${dirError.message}`);
      // 如果目录删除失败，尝试逐个删除照片文件作为备用方案
      if (station.photos && station.photos.length > 0) {
        station.photos.forEach(photo => {
          try {
            let filePath;
            if (photo.path) {
              const relativePath = photo.path.startsWith('/') ? photo.path.substring(1) : photo.path;
              filePath = path.join(DATA_DIR, relativePath);
            } else {
              filePath = path.join(DATA_DIR, 'pictures', id, photo.filename);
            }
            
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              deletedPhotos++;
              log('info', `备用方案：成功删除照片文件: ${filePath}`);
            }
          } catch (photoError) {
            log('error', `备用方案：删除照片文件失败: ${photo.filename || photo.path}, 错误: ${photoError.message}`);
          }
        });
      }
    }
    
    // 从数组中移除站点
    data.batterySwapStations.splice(stationIndex, 1);
    
    // 更新metadata
    data.metadata.totalStations = data.batterySwapStations.length;
    data.metadata.lastUpdated = new Date().toISOString();
    
    // 保存数据
    const saved = saveData(data, STATIONS_FILE);
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: '保存站点数据失败'
      });
    }
    
    res.json({
      success: true,
      message: '站点删除成功',
      deletedPhotos: deletedPhotos
    });
  } catch (error) {
    log('error', `删除站点失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '删除站点失败',
      error: error.message
    });
  }
};

// 添加照片到站点
export const addPhotoToStation = (req, res) => {
  try {
    const { id } = req.params;
    const photoData = req.body;
    
    // 验证必要字段
    if (!photoData.base64Data || !photoData.filename) {
      return res.status(400).json({
        status: 1,
        message: '缺少必要的照片数据'
      });
    }
    
    const data = readData(STATIONS_FILE);
    const stationIndex = data.batterySwapStations.findIndex(s => s.id === id);
    
    if (stationIndex === -1) {
      return res.status(404).json({
        status: 1,
        message: '站点不存在'
      });
    }
    
    const station = data.batterySwapStations[stationIndex];
    
    // 确保照片目录存在
    const picturesDir = path.join(DATA_DIR, 'pictures');
    if (!fs.existsSync(picturesDir)) {
      fs.mkdirSync(picturesDir, { recursive: true });
    }
    
    // 创建站点专用目录
    const stationPicturesDir = path.join(picturesDir, id);
    if (!fs.existsSync(stationPicturesDir)) {
      fs.mkdirSync(stationPicturesDir, { recursive: true });
    }
    
    // 保存照片文件
    const base64Data = photoData.base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = path.join(stationPicturesDir, photoData.filename);
    
    fs.writeFileSync(filePath, buffer);
    
    // 更新照片信息
    const photoInfo = {
      id: photoData.id,
      filename: photoData.filename,
      path: `/pictures/${id}/${photoData.filename}`,
      description: photoData.description || '',
      uploadTime: photoData.uploadTime || new Date().toISOString(),
      size: photoData.size || buffer.length
    };
    
    // 添加到站点照片列表
    if (!station.photos) {
      station.photos = [];
    }
    station.photos.push(photoInfo);
    
    // 更新metadata
    data.metadata.lastUpdated = new Date().toISOString();
    
    // 保存数据
    const saved = saveData(data, STATIONS_FILE);
    if (!saved) {
      return res.status(500).json({
        status: 1,
        message: '保存照片信息失败'
      });
    }
    
    log('info', `照片已添加到站点 ${id}: ${photoData.filename}`);
    
    res.json({
      status: 0,
      message: '照片上传成功',
      data: photoInfo
    });
  } catch (error) {
    log('error', `添加照片失败: ${error.message}`);
    res.status(500).json({
      status: 1,
      message: '添加照片失败',
      error: error.message
    });
  }
};

// 获取站点照片
export const getStationPhoto = (req, res) => {
  try {
    const { id, filename } = req.params;
    const filePath = path.join(DATA_DIR, 'pictures', id, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 1,
        message: '照片不存在'
      });
    }
    
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    log('error', `获取照片失败: ${error.message}`);
    res.status(500).json({
      status: 1,
      message: '获取照片失败',
      error: error.message
    });
  }
};

// 删除站点照片
export const deleteStationPhoto = (req, res) => {
  try {
    const { id, photoId } = req.params;
    const data = readData(STATIONS_FILE);
    const stationIndex = data.batterySwapStations.findIndex(s => s.id === id);
    
    if (stationIndex === -1) {
      return res.status(404).json({
        status: 1,
        message: '站点不存在'
      });
    }
    
    const station = data.batterySwapStations[stationIndex];
    if (!station.photos) {
      return res.status(404).json({
        status: 1,
        message: '照片不存在'
      });
    }
    
    const photoIndex = station.photos.findIndex(p => p.id === photoId);
    if (photoIndex === -1) {
      return res.status(404).json({
        status: 1,
        message: '照片不存在'
      });
    }
    
    const photo = station.photos[photoIndex];
    
    // 删除文件
    const filePath = path.join(DATA_DIR, 'pictures', id, photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // 从数组中移除
    station.photos.splice(photoIndex, 1);
    
    // 更新metadata
    data.metadata.lastUpdated = new Date().toISOString();
    
    // 保存数据
    const saved = saveData(data, STATIONS_FILE);
    if (!saved) {
      return res.status(500).json({
        status: 1,
        message: '保存数据失败'
      });
    }
    
    res.json({
       status: 0,
       message: '照片删除成功'
     });
   } catch (error) {
     log('error', `删除照片失败: ${error.message}`);
     res.status(500).json({
       status: 1,
       message: '删除照片失败',
       error: error.message
     });
   }
 };
