import 'dotenv/config';
// 导入依赖模块
import chalk from 'chalk';
// 导入 express 模块
import express from 'express';
// 导入 cors 中间件
import cors from 'cors';
import pkg from 'body-parser';
const { urlencoded, json } = pkg;

import fs from 'fs';
import path from 'path';

// 初始化环境变量
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
const DB_FILE = process.env.DB_FILE || 'db.json';
const DB_PATH = path.join(DATA_DIR, DB_FILE);
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || 5) * 1024 * 1024; // MB转字节
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// 创建 express 的服务器实例
const app = express()

// 自定义日志函数
function log(level, message) {
  const levels = ['debug', 'info', 'error'];
  if (levels.indexOf(level) >= levels.indexOf(LOG_LEVEL)) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
}

// 创建数据目录
const initDataDirectory = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      log('info', `创建数据目录: ${DATA_DIR}`);
    }
    
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ items: [] }, null, 2));
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

initDataDirectory();

// 中间件
app.use(express.json({ limit: '1mb' })); // 限制请求体大小

// 将 cors 注册为全局中间件
app.use(cors())


// 参数解析
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());

// 数据操作函数
const readData = () => {
  try {
    const rawData = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    log('error', `读取数据错误: ${error.message}`);
    return { items: [] };
  }
};

const saveData = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    log('error', `保存数据错误: ${error.message}`);
    return false;
  }
};

// 导入并注册用户路由模块
import stationRouter from './router/station.js';
app.use('/station', stationRouter)

// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(PORT, function () {
    console.log(`\n${chalk.green('✓ API Server started successfully')}`);
    console.log(`${chalk.gray('────────────────────────────────────')}`);
    console.log(`${chalk.blue('Time:')} ${new Date().toLocaleTimeString()}`);
    console.log(`${chalk.blue('URL:')}  ${chalk.underline(`http://127.0.0.1:${PORT}`)}`);
    console.log(`${chalk.gray('────────────────────────────────────\n')}`);
})