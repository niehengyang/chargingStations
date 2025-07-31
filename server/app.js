import 'dotenv/config';
// 导入依赖模块
import chalk from 'chalk';
// 导入 express 模块
import express from 'express';
// 导入 cors 中间件
import cors from 'cors';
import { PORT, DATA_DIR, DB_PATH, MAX_FILE_SIZE, LOG_LEVEL, PICTURES_DIR } from './config/env.js';
import path from 'path';

// 创建 express 的服务器实例
const app = express()

import { log } from './utils/logger.js';

import { initDataDirectory, readData, saveData } from './utils/dataHandler.js';
initDataDirectory();

// 配置跨域中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-App-Version', 'X-App-Name']
}));

// 中间件 - 请求体解析
app.use(express.json({ limit: '50mb' })); // JSON解析器
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // URL编码解析器

// 配置静态资源访问路径
const picturesPath = path.join(DATA_DIR, 'pictures');
app.use('/pictures', express.static(picturesPath));
console.log(`Static files served from: ${picturesPath}`);

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