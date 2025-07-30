# 换电站管理系统 - Docker 部署指南

## 概述

本指南介绍如何使用 Docker 和 Docker Compose 在阿里云服务器上部署换电站管理系统。Docker 部署具有以下优势：

- 🚀 **快速部署**：一键启动所有服务
- 🔒 **环境隔离**：避免环境冲突
- 📦 **易于管理**：统一的容器管理
- 🔄 **易于扩展**：支持水平扩展
- 🛡️ **安全可靠**：容器级别的安全隔离

## 架构说明

```
┌─────────────────────────────────────────┐
│                Nginx                    │
│         (反向代理 + 静态文件)              │
├─────────────────────────────────────────┤
│              Frontend                   │
│            (Vue 3 应用)                 │
├─────────────────────────────────────────┤
│               Backend                   │
│           (Express.js API)              │
├─────────────────────────────────────────┤
│               Redis                     │
│              (缓存服务)                  │
└─────────────────────────────────────────┘
```

## 前置要求

### 阿里云服务器配置
- **CPU**: 2核心或以上
- **内存**: 4GB 或以上
- **存储**: 40GB 或以上
- **操作系统**: Ubuntu 20.04 LTS / CentOS 7+ / Debian 10+
- **网络**: 公网IP，开放 80、443、22 端口

### 本地开发环境
- Docker Desktop (Windows/Mac) 或 Docker Engine (Linux)
- Docker Compose v2.0+
- Git

## 快速开始

### 1. 服务器环境准备

#### 1.1 连接服务器
```bash
ssh root@your-server-ip
```

#### 1.2 安装 Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
```

#### 1.3 安装 Docker Compose
```bash
# 下载 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### 2. 部署应用

#### 2.1 克隆项目
```bash
git clone <your-repository-url>
cd chargingStationWeb
```

#### 2.2 配置环境变量
```bash
# 复制环境配置文件
cp .env.pro .env

# 编辑配置文件
vim .env
```

更新 API 地址为服务器地址：
```env
# API 服务配置
VITE_API_BASE_URL=http://your-server-ip/api/
VITE_API_URL=http://your-server-ip/api

# 或使用域名
# VITE_API_BASE_URL=https://yourdomain.com/api/
# VITE_API_URL=https://yourdomain.com/api
```

#### 2.3 启动服务
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 2.4 验证部署
```bash
# 检查容器状态
docker-compose ps

# 检查健康状态
docker-compose exec api curl http://localhost:3001/station/health
docker-compose exec web curl http://localhost/health
```

### 3. 访问应用

部署完成后，可以通过以下地址访问：
- **前端应用**: http://your-server-ip
- **API 接口**: http://your-server-ip/api
- **图片资源**: http://your-server-ip/pictures

## 高级配置

### HTTPS 配置

#### 1. 准备 SSL 证书
```bash
# 创建 SSL 证书目录
mkdir -p docker/ssl

# 方式1: 使用 Let's Encrypt (推荐)
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/ssl/key.pem

# 方式2: 使用自签名证书 (仅用于测试)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/ssl/key.pem \
  -out docker/ssl/cert.pem \
  -subj "/C=CN/ST=State/L=City/O=Organization/CN=yourdomain.com"
```

#### 2. 更新 Nginx 配置
编辑 `docker/nginx.conf`，取消注释 HTTPS 配置部分。

#### 3. 更新 Docker Compose
```yaml
# 在 docker-compose.yml 中添加 443 端口映射
web:
  ports:
    - "80:80"
    - "443:443"
```

#### 4. 重启服务
```bash
docker-compose down
docker-compose up -d
```

### 域名配置

1. **DNS 解析**: 将域名 A 记录指向服务器 IP
2. **更新配置**: 修改 `docker/nginx.conf` 中的 `server_name`
3. **重启服务**: `docker-compose restart web`

### 数据持久化

项目使用 Docker volumes 进行数据持久化：

```bash
# 查看数据卷
docker volume ls

# 备份数据
docker run --rm -v chargingstationweb_api_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .

# 恢复数据
docker run --rm -v chargingstationweb_api_data:/data -v $(pwd):/backup alpine tar xzf /backup/data-backup.tar.gz -C /data
```

## 运维管理

### 日常操作

```bash
# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f api
docker-compose logs -f web

# 重启服务
docker-compose restart

# 重启特定服务
docker-compose restart api

# 停止服务
docker-compose stop

# 启动服务
docker-compose start

# 完全停止并删除容器
docker-compose down

# 停止并删除容器、网络、数据卷
docker-compose down -v
```

### 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 或者分步执行
docker-compose build
docker-compose up -d
```

### 扩容配置

```bash
# 扩展 API 服务实例
docker-compose up -d --scale api=3

# 查看扩展后的服务
docker-compose ps
```

### 监控和健康检查

```bash
# 查看容器健康状态
docker-compose ps

# 查看详细健康检查信息
docker inspect --format='{{.State.Health.Status}}' charging-station-api
docker inspect --format='{{.State.Health.Status}}' charging-station-web

# 手动执行健康检查
docker-compose exec api curl http://localhost:3001/station/health
docker-compose exec web curl http://localhost/health
```

### 性能监控

```bash
# 查看容器资源使用情况
docker stats

# 查看特定容器资源使用
docker stats charging-station-api charging-station-web

# 查看容器详细信息
docker inspect charging-station-api
```

## 故障排除

### 常见问题

#### 1. 容器启动失败
```bash
# 查看详细错误信息
docker-compose logs api
docker-compose logs web

# 检查容器状态
docker-compose ps

# 进入容器调试
docker-compose exec api sh
docker-compose exec web sh
```

#### 2. 网络连接问题
```bash
# 检查网络配置
docker network ls
docker network inspect chargingstationweb_charging-station-network

# 测试容器间连通性
docker-compose exec web ping api
docker-compose exec api ping web
```

#### 3. 数据丢失问题
```bash
# 检查数据卷
docker volume ls
docker volume inspect chargingstationweb_api_data

# 查看数据卷内容
docker run --rm -v chargingstationweb_api_data:/data alpine ls -la /data
```

#### 4. 端口冲突
```bash
# 检查端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# 修改端口映射
# 在 docker-compose.yml 中修改 ports 配置
```

### 日志分析

```bash
# 查看 Nginx 访问日志
docker-compose exec web tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
docker-compose exec web tail -f /var/log/nginx/error.log

# 查看应用日志
docker-compose logs -f api

# 导出日志到文件
docker-compose logs api > api.log
docker-compose logs web > web.log
```

## 安全配置

### 防火墙设置
```bash
# Ubuntu (UFW)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 容器安全
```bash
# 定期更新基础镜像
docker-compose pull
docker-compose up -d

# 清理未使用的镜像
docker image prune -f

# 清理未使用的容器
docker container prune -f

# 清理未使用的网络
docker network prune -f
```

## 备份策略

### 自动备份脚本
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/charging-station"
mkdir -p $BACKUP_DIR

# 备份数据卷
docker run --rm \
  -v chargingstationweb_api_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/data_$DATE.tar.gz -C /data .

# 备份配置文件
tar czf $BACKUP_DIR/config_$DATE.tar.gz docker/ docker-compose.yml .env

# 清理7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR"
```

### 定时备份
```bash
# 添加到 crontab
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## 性能优化

### 1. 资源限制
```yaml
# 在 docker-compose.yml 中添加资源限制
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 2. 缓存优化
```bash
# 启用 Redis 缓存
docker-compose up -d redis

# 配置应用使用 Redis
# 在应用代码中添加 Redis 连接配置
```

### 3. 镜像优化
```dockerfile
# 使用多阶段构建减小镜像大小
# 使用 alpine 基础镜像
# 清理不必要的文件
```

---

## 总结

Docker 部署方式提供了一个标准化、可重复的部署流程。通过本指南，你可以：

✅ 快速在阿里云服务器上部署换电站管理系统  
✅ 实现服务的容器化管理  
✅ 配置 HTTPS 和域名访问  
✅ 进行日常运维和故障排除  
✅ 实施备份和安全策略  

如需更多帮助，请参考 [阿里云部署指南.md](./阿里云部署指南.md) 或联系技术支持。