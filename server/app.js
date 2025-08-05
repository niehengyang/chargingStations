import 'dotenv/config';
// 导入依赖模块
import chalk from 'chalk';
// 导入 express 模块
import express from 'express';
import { PORT } from './config/env.js';

// 创建 express 的服务器实例
const app = express()

import { initDataDirectory } from './utils/dataHandler.js';
import { setupMiddleware } from './middleware/index.js';

// 初始化数据目录
initDataDirectory();

// 配置所有中间件
setupMiddleware(app);

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