import path from 'path';
import 'dotenv/config';

// 环境变量配置
export const PORT = process.env.PORT || 3001;
export const DATA_DIR = path.resolve(process.env.DATA_DIR || '/data');
export const DB_FILE = process.env.DB_FILE || 'db.json';
export const DB_PATH = path.join(DATA_DIR, DB_FILE);
export const PICTURES_DIR = process.env.PICTURES_DIR || '/pictures';
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || 5) * 1024 * 1024; // MB转字节
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// 跨域配置
export const CORS_ORIGINS = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];