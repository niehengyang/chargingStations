import cors from 'cors';
import express from 'express';
import path from 'path';
import { DATA_DIR, CORS_ORIGINS } from '../config/env.js';

/**
 * 配置跨域中间件
 * @param {Express} app Express应用实例
 */
export function setupCors(app) {
  app.use(cors({
    origin: CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-App-Version', 'X-App-Name']
  }));
}

/**
 * 配置请求体解析中间件
 * @param {Express} app Express应用实例
 */
export function setupBodyParser(app) {
  // JSON解析器
  app.use(express.json({ limit: '50mb' }));
  // URL编码解析器
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
}

/**
 * 配置静态资源访问中间件
 * @param {Express} app Express应用实例
 */
export function setupStaticFiles(app) {
  const picturesPath = path.join(DATA_DIR, 'pictures');
  app.use('/pictures', express.static(picturesPath));
  console.log(`Static files served from: ${picturesPath}`);
}

/**
 * 初始化所有中间件
 * @param {Express} app Express应用实例
 */
export function setupMiddleware(app) {
  // 配置跨域中间件
  setupCors(app);
  
  // 配置请求体解析中间件
  setupBodyParser(app);
  
  // 配置静态资源访问中间件
  setupStaticFiles(app);
}