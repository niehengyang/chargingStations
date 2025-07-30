#!/bin/bash

# 换电站管理系统 - 一键快速部署脚本
# 适用于阿里云 Ubuntu/CentOS 服务器
# 使用方法：curl -sSL https://raw.githubusercontent.com/your-repo/main/quick-deploy.sh | bash -s your-server-ip

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 显示横幅
show_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    换电站管理系统                              ║"
    echo "║                   一键部署脚本 v1.0                           ║"
    echo "║                                                              ║"
    echo "║  🚀 自动安装 Docker 环境                                      ║"
    echo "║  📦 一键部署前后端服务                                         ║"
    echo "║  🔧 自动配置 Nginx 反向代理                                   ║"
    echo "║  🛡️  配置防火墙和安全设置                                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 检测操作系统
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        log_error "无法检测操作系统"
        exit 1
    fi
    
    log_info "检测到操作系统: $OS $VER"
}

# 安装 Docker
install_docker() {
    log_info "开始安装 Docker..."
    
    if command -v docker &> /dev/null; then
        log_warning "Docker 已安装，跳过安装步骤"
        return
    fi
    
    # 安装 Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # 启动 Docker 服务
    systemctl start docker
    systemctl enable docker
    
    # 添加当前用户到 docker 组
    usermod -aG docker $USER
    
    log_success "Docker 安装完成"
}

# 安装 Docker Compose
install_docker_compose() {
    log_info "开始安装 Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        log_warning "Docker Compose 已安装，跳过安装步骤"
        return
    fi
    
    # 下载 Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # 创建软链接
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log_success "Docker Compose 安装完成"
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu/Debian
        ufw --force enable
        ufw allow 22
        ufw allow 80
        ufw allow 443
        log_success "UFW 防火墙配置完成"
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL
        systemctl start firewalld
        systemctl enable firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        log_success "Firewalld 防火墙配置完成"
    else
        log_warning "未检测到防火墙，请手动配置"
    fi
}

# 创建项目目录和文件
setup_project() {
    log_info "创建项目目录和配置文件..."
    
    PROJECT_DIR="/opt/charging-station"
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR
    
    # 创建 docker-compose.yml
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # 后端 API 服务
  api:
    image: node:18-alpine
    container_name: charging-station-api
    restart: unless-stopped
    working_dir: /app
    command: sh -c "npm install && node app.js"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATA_DIR=/app/data
      - DB_FILE=battery-swap-station-data.json
      - PICTURES_DIR=/pictures
      - MAX_FILE_SIZE=5
      - LOG_LEVEL=info
    volumes:
      - ./server:/app
      - api_data:/app/data
    networks:
      - charging-station-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/station/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # 前端 Web 服务
  web:
    image: nginx:alpine
    container_name: charging-station-web
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      api:
        condition: service_healthy
    networks:
      - charging-station-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  api_data:
    driver: local

networks:
  charging-station-network:
    driver: bridge
EOF

    # 创建 Nginx 配置
    cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://api:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 图片资源代理
    location /pictures/ {
        proxy_pass http://api:3001/pictures/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    log_success "项目配置文件创建完成"
}

# 下载项目代码
download_project() {
    log_info "下载项目代码..."
    
    # 这里需要替换为实际的项目仓库地址
    if [[ -n "$REPO_URL" ]]; then
        git clone $REPO_URL temp_repo
        cp -r temp_repo/server .
        cp -r temp_repo/dist frontend 2>/dev/null || {
            log_warning "未找到构建好的前端文件，需要手动上传"
            mkdir -p frontend
            echo "<h1>请上传前端构建文件到 $PROJECT_DIR/frontend 目录</h1>" > frontend/index.html
        }
        rm -rf temp_repo
    else
        log_warning "未指定仓库地址，创建示例文件"
        
        # 创建示例后端代码
        mkdir -p server
        cat > server/package.json << 'EOF'
{
  "name": "charging-station-api",
  "version": "1.0.0",
  "main": "app.js",
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5"
  }
}
EOF

        cat > server/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/station/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 示例 API
app.get('/station/list', (req, res) => {
    res.json({ message: '换电站管理系统 API 正在运行', data: [] });
});

app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
});
EOF

        # 创建示例前端页面
        mkdir -p frontend
        cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>换电站管理系统</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .success { color: #28a745; }
        .info { color: #17a2b8; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="success">🎉 换电站管理系统部署成功！</h1>
        <p class="info">系统已成功部署到阿里云服务器</p>
        <p>请上传实际的前端构建文件到服务器</p>
        <hr>
        <p><strong>API 测试:</strong> <a href="/api/station/health" target="_blank">/api/station/health</a></p>
        <p><strong>部署时间:</strong> <span id="time"></span></p>
    </div>
    <script>
        document.getElementById('time').textContent = new Date().toLocaleString('zh-CN');
    </script>
</body>
</html>
EOF
    fi
    
    log_success "项目代码准备完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    cd /opt/charging-station
    
    # 启动服务
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        log_success "服务启动成功"
    else
        log_error "服务启动失败，请检查日志"
        docker-compose logs
        exit 1
    fi
}

# 显示部署结果
show_result() {
    local SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "your-server-ip")
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🎉 部署成功完成！                          ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║                                                              ║"
    echo "║  📱 前端访问地址: http://$SERVER_IP                    ║"
    echo "║  🔌 API 接口地址: http://$SERVER_IP/api            ║"
    echo "║  📊 服务状态检查: http://$SERVER_IP/health         ║"
    echo "║                                                              ║"
    echo "║  📁 项目目录: /opt/charging-station                          ║"
    echo "║  📋 管理命令: cd /opt/charging-station && docker-compose     ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_info "常用管理命令:"
    echo "  查看服务状态: docker-compose ps"
    echo "  查看日志: docker-compose logs -f"
    echo "  重启服务: docker-compose restart"
    echo "  停止服务: docker-compose stop"
    echo "  更新服务: docker-compose pull && docker-compose up -d"
    
    log_info "下一步操作建议:"
    echo "  1. 上传实际的前端构建文件到 /opt/charging-station/frontend/"
    echo "  2. 配置域名解析（可选）"
    echo "  3. 配置 HTTPS 证书（推荐）"
    echo "  4. 设置定时备份"
}

# 主函数
main() {
    # 检查是否为 root 用户
    if [[ $EUID -ne 0 ]]; then
        log_error "请使用 root 用户运行此脚本"
        exit 1
    fi
    
    show_banner
    
    # 检测操作系统
    detect_os
    
    # 更新系统
    log_info "更新系统包..."
    if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
        apt update && apt upgrade -y
        apt install -y curl wget git
    elif [[ "$OS" == "centos" ]] || [[ "$OS" == "rhel" ]]; then
        yum update -y
        yum install -y curl wget git
    fi
    
    # 安装 Docker 环境
    install_docker
    install_docker_compose
    
    # 配置防火墙
    setup_firewall
    
    # 设置项目
    setup_project
    download_project
    
    # 启动服务
    start_services
    
    # 显示结果
    show_result
    
    log_success "\n✅ 换电站管理系统部署完成！"
}

# 捕获错误
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 运行主函数
main "$@"