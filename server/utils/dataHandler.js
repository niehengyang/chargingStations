import fs from 'fs';
import { DATA_DIR, DB_PATH, MAX_FILE_SIZE } from '../config/env.js';
import { log } from './logger.js';

// 初始化数据目录
export const initDataDirectory = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      log('info', `创建数据目录: ${DATA_DIR}`);
    }
    
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ batterySwapStations: [] }, null, 2));
      log('info', `创建数据库文件: ${DB_PATH}`);
    } else {
      // 检查文件大小
      const stats = fs.statSync(DB_PATH);
      if (stats.size > MAX_FILE_SIZE) {
        log('error', `JSON文件超过大小限制 (${MAX_FILE_SIZE}字节)`);
        process.exit(1);
      }
    }
  } catch (error) {
    log('error', `初始化失败: ${error.message}`);
    process.exit(1);
  }
};

// 读取数据
export const readData = (filePath = DB_PATH) => {
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    log('error', `读取数据错误: ${error.message}`);
    return { batterySwapStations: [] };
  }
};

// 保存数据
export const saveData = (data, filePath = DB_PATH) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    log('error', `保存数据错误: ${error.message}`);
    return false;
  }
};