import { LOG_LEVEL } from '../config/env.js';

// 自定义日志函数
export function log(level, message) {
  const levels = ['debug', 'info', 'error'];
  if (levels.indexOf(level) >= levels.indexOf(LOG_LEVEL)) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
}