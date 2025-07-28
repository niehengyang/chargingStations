import 'dotenv/config';
// 导入依赖模块
import chalk from 'chalk';
// 导入 express 模块
import express from 'express';
// 导入 cors 中间件
import cors from 'cors';
import pkg from 'body-parser';
const { urlencoded, json } = pkg;

import { PORT, DATA_DIR, DB_PATH, MAX_FILE_SIZE, LOG_LEVEL } from './config/env.js';

// 创建 express 的服务器实例
const app = express()

import { log } from './utils/logger.js';

import { initDataDirectory, readData, saveData } from './utils/dataHandler.js';
initDataDirectory();

// 中间件
app.use(express.json({ limit: '50mb' })); // 限制请求体大小
// 将 cors 注册为全局中间件
app.use(cors())

// 参数解析
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());

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