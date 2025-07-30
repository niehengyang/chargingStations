# 多阶段构建 Dockerfile
# 第一阶段：构建前端
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# 复制前端项目文件
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY legacy.ts ./
COPY index.html ./
COPY .env.pro .env

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY src/ ./src/
COPY public/ ./public/

# 构建前端
RUN npm run build:pro

# 第二阶段：后端运行环境
FROM node:18-alpine AS backend

WORKDIR /app

# 安装必要的系统包
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# 复制后端项目文件
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 复制后端源代码
COPY server/ ./

# 创建数据目录
RUN mkdir -p /app/data/pictures && \
    chown -R nodejs:nodejs /app

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/station/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# 启动命令
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "app.js"]

# 第三阶段：Nginx + 前端静态文件
FROM nginx:alpine AS frontend

# 复制构建好的前端文件
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]