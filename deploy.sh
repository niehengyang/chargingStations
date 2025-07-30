#!/bin/bash

# 换电站管理系统 - 阿里云自动部署脚本
# 使用方法：./deploy.sh [server-ip] [domain-name]

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
if [ $# -lt 1 ]; then
    log_error "使用方法: $0 <server-ip> [domain-name]"
    log_info "示例: $0 123.456.789.0 yourdomain.com"
    exit 1
fi

SERVER_IP=$1
DOMAIN_NAME=${2:-$SERVER_IP}
PROJECT_NAME="charging-station"
REMOTE_PATH="/var/www/$PROJECT_NAME"
LOCAL_BUILD_DIR="./dist"
SERVER_DIR="./server"

log_info "开始部署换电站管理系统到阿里云服务器"
log_info "服务器IP: $SERVER_IP"
log_info "域名: $DOMAIN_NAME"

# 检查本地文件
if [ ! -d "$SERVER_DIR" ]; then
    log_error "未找到服务器代码目录: $SERVER_DIR"
    exit 1
fi

if [ ! -f "package.json" ]; then
    log_error "未找到 package.json 文件，请在项目根目录运行此脚本"
    exit 1
fi

# 构建前端
log_info "开始构建前端应用..."
if [ ! -f ".env.pro" ]; then
    log_warning "未找到 .env.pro 文件，将使用默认配置"
    cp .env .env.pro
fi

# 更新生产环境API地址
log_info "更新生产环境配置..."
sed -i.bak "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=http://$SERVER_IP:3001/|g" .env.pro
sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=http://$SERVER_IP:3001|g" .env.pro

# 构建项目
npm run build:pro

if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    log_error "构建失败，未找到 $LOCAL_BUILD_DIR 目录"
    exit 1
fi

log_success "前端构建完成"

# 检查服务器连接
log_info "检查服务器连接..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@$SERVER_IP exit 2>/dev/null; then
    log_error "无法连接到服务器 $SERVER_IP，请检查:"
    log_error "1. 服务器IP是否正确"
    log_error "2. SSH密钥是否已配置"
    log_error "3. 安全组是否开放22端口"
    exit 1
fi

log_success "服务器连接正常"

# 服务器环境检查和安装
log_info "检查服务器环境..."
ssh root@$SERVER_IP << 'ENDSSH'
set -e

# 检查并安装 Node.js
if ! command -v node &> /dev/null; then
    echo "安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# 检查并安装 Nginx
if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    apt update
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi

# 检查并安装 PM2
if ! command -v pm2 &> /dev/null; then
    echo "安装 PM2..."
    npm install -g pm2
fi

echo "环境检查完成"
ENDSSH

log_success "服务器环境准备完成"

# 创建项目目录
log_info "创建项目目录..."
ssh root@$SERVER_IP "mkdir -p $REMOTE_PATH/{frontend,server,data/pictures}"

# 上传后端代码
log_info "上传后端代码..."
rsync -avz --delete $SERVER_DIR/ root@$SERVER_IP:$REMOTE_PATH/server/

# 上传前端构建文件
log_info "上传前端文件..."
rsync -avz --delete $LOCAL_BUILD_DIR/ root@$SERVER_IP:$REMOTE_PATH/frontend/

# 服务器端配置
log_info "配置服务器..."
ssh root@$SERVER_IP << ENDSSH
set -e

# 安装后端依赖
cd $REMOTE_PATH/server
npm install --production

# 创建环境配置文件
if [ ! -f .env ]; then
    cat > .env << EOF
# 服务端口
PORT=3001

# 数据存储目录
DATA_DIR="$REMOTE_PATH/data"

# 数据库文件名
DB_FILE="battery-swap-station-data.json"

# 图片存储目录
PICTURES_DIR="/pictures"

# 最大JSON文件大小 (单位: MB)
MAX_FILE_SIZE=5

# 日志级别
LOG_LEVEL="info"
EOF
fi

# 设置目录权限
chown -R www-data:www-data $REMOTE_PATH/data
chmod -R 755 $REMOTE_PATH/data

# 创建PM2配置文件
cat > $REMOTE_PATH/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'charging-station-api',
    script: 'app.js',
    cwd: '$REMOTE_PATH/server',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: '/var/log/charging-station-api.log',
    error_file: '/var/log/charging-station-api-error.log',
    out_file: '/var/log/charging-station-api-out.log',
    time: true
  }]
};
EOF

# 启动或重启PM2服务
cd $REMOTE_PATH
if pm2 describe charging-station-api > /dev/null 2>&1; then
    echo "重启现有服务..."
    pm2 restart charging-station-api
else
    echo "启动新服务..."
    pm2 start ecosystem.config.js
    pm2 startup
    pm2 save
fi

# 配置Nginx
cat > /etc/nginx/sites-available/charging-station << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    # 前端静态文件
    location / {
        root $REMOTE_PATH/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # 缓存静态资源
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # 图片资源代理
    location /pictures/ {
        proxy_pass http://localhost:3001/pictures/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/charging-station /etc/nginx/sites-enabled/

# 测试Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx

echo "服务器配置完成"
ENDSSH

log_success "部署完成！"

# 检查服务状态
log_info "检查服务状态..."
ssh root@$SERVER_IP << 'ENDSSH'
echo "=== PM2 服务状态 ==="
pm2 status

echo "\n=== Nginx 状态 ==="
systemctl status nginx --no-pager -l

echo "\n=== 端口监听状态 ==="
netstat -tlnp | grep -E ':(80|3001)\s'
ENDSSH

log_success "\n🎉 部署成功完成！"
log_info "\n访问地址:"
log_info "  HTTP:  http://$DOMAIN_NAME"
log_info "  API:   http://$DOMAIN_NAME/api"

if [ "$DOMAIN_NAME" != "$SERVER_IP" ]; then
    log_warning "\n⚠️  请确保域名 $DOMAIN_NAME 已正确解析到服务器 IP: $SERVER_IP"
fi

log_info "\n📋 后续操作建议:"
log_info "  1. 配置 HTTPS: sudo certbot --nginx -d $DOMAIN_NAME"
log_info "  2. 设置防火墙: sudo ufw allow 80 && sudo ufw allow 443"
log_info "  3. 监控日志: ssh root@$SERVER_IP 'pm2 logs'"
log_info "  4. 查看详细部署指南: 阿里云部署指南.md"

log_success "\n✅ 部署脚本执行完成！"