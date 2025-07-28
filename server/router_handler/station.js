import { readData, saveData } from '../utils/dataHandler.js';
import { DATA_DIR, DB_FILE } from '../config/env.js';
import path from 'path';
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
    status: 0,
    message: 'ok',
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
    
    const initialLength = data.batterySwapStations.length;
    data.batterySwapStations = data.batterySwapStations.filter(s => s.id !== id);
    
    if (data.batterySwapStations.length === initialLength) {
      return res.status(404).json({
        status: 1,
        message: '站点不存在'
      });
    }
    
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
    
    res.json({
      status: 0,
      message: '站点删除成功'
    });
  } catch (error) {
    log('error', `删除站点失败: ${error.message}`);
    res.status(500).json({
      status: 1,
      message: '删除站点失败',
      error: error.message
    });
  }
};
