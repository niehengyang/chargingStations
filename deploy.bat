@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 换电站管理系统 - 阿里云自动部署脚本 (Windows版本)
REM 使用方法：deploy.bat [server-ip] [domain-name]

REM 颜色定义
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 检查参数
if "%1"=="" (
    echo %RED%[ERROR]%NC% 使用方法: %0 ^<server-ip^> [domain-name]
    echo %BLUE%[INFO]%NC% 示例: %0 123.456.789.0 yourdomain.com
    exit /b 1
)

set "SERVER_IP=%1"
if "%2"=="" (
    set "DOMAIN_NAME=%SERVER_IP%"
) else (
    set "DOMAIN_NAME=%2"
)

set "PROJECT_NAME=charging-station"
set "REMOTE_PATH=/var/www/%PROJECT_NAME%"
set "LOCAL_BUILD_DIR=.\dist"
set "SERVER_DIR=.\server"

echo %BLUE%[INFO]%NC% 开始部署换电站管理系统到阿里云服务器
echo %BLUE%[INFO]%NC% 服务器IP: %SERVER_IP%
echo %BLUE%[INFO]%NC% 域名: %DOMAIN_NAME%

REM 检查本地文件
if not exist "%SERVER_DIR%" (
    echo %RED%[ERROR]%NC% 未找到服务器代码目录: %SERVER_DIR%
    exit /b 1
)

if not exist "package.json" (
    echo %RED%[ERROR]%NC% 未找到 package.json 文件，请在项目根目录运行此脚本
    exit /b 1
)

REM 检查必要工具
where npm >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% 未找到 npm，请先安装 Node.js
    exit /b 1
)

where ssh >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% 未找到 ssh 命令，请安装 OpenSSH 或使用 Git Bash
    echo %YELLOW%[WARNING]%NC% 你可以使用 Git Bash 运行 deploy.sh 脚本
    exit /b 1
)

where scp >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% 未找到 scp 命令，请安装 OpenSSH 或使用 Git Bash
    exit /b 1
)

REM 构建前端
echo %BLUE%[INFO]%NC% 开始构建前端应用...
if not exist ".env.pro" (
    echo %YELLOW%[WARNING]%NC% 未找到 .env.pro 文件，将复制 .env 文件
    copy .env .env.pro >nul
)

REM 更新生产环境API地址
echo %BLUE%[INFO]%NC% 更新生产环境配置...
powershell -Command "(Get-Content .env.pro) -replace 'VITE_API_BASE_URL=.*', 'VITE_API_BASE_URL=http://%SERVER_IP%:3001/' | Set-Content .env.pro.tmp"
powershell -Command "(Get-Content .env.pro.tmp) -replace 'VITE_API_URL=.*', 'VITE_API_URL=http://%SERVER_IP%:3001' | Set-Content .env.pro"
del .env.pro.tmp >nul 2>&1

REM 构建项目
echo %BLUE%[INFO]%NC% 执行构建命令...
call npm run build:pro
if errorlevel 1 (
    echo %RED%[ERROR]%NC% 前端构建失败
    exit /b 1
)

if not exist "%LOCAL_BUILD_DIR%" (
    echo %RED%[ERROR]%NC% 构建失败，未找到 %LOCAL_BUILD_DIR% 目录
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% 前端构建完成

REM 检查服务器连接
echo %BLUE%[INFO]%NC% 检查服务器连接...
ssh -o ConnectTimeout=10 -o BatchMode=yes root@%SERVER_IP% exit >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% 无法连接到服务器 %SERVER_IP%，请检查:
    echo %RED%[ERROR]%NC% 1. 服务器IP是否正确
    echo %RED%[ERROR]%NC% 2. SSH密钥是否已配置
    echo %RED%[ERROR]%NC% 3. 安全组是否开放22端口
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% 服务器连接正常

REM 创建临时脚本文件
echo %BLUE%[INFO]%NC% 准备服务器环境...

REM 创建环境检查脚本
echo set -e > temp_env_check.sh
echo. >> temp_env_check.sh
echo # 检查并安装 Node.js >> temp_env_check.sh
echo if ! command -v node ^&^> /dev/null; then >> temp_env_check.sh
echo     echo "安装 Node.js..." >> temp_env_check.sh
echo     curl -fsSL https://deb.nodesource.com/setup_18.x ^| bash - >> temp_env_check.sh
echo     apt-get install -y nodejs >> temp_env_check.sh
echo fi >> temp_env_check.sh
echo. >> temp_env_check.sh
echo # 检查并安装 Nginx >> temp_env_check.sh
echo if ! command -v nginx ^&^> /dev/null; then >> temp_env_check.sh
echo     echo "安装 Nginx..." >> temp_env_check.sh
echo     apt update >> temp_env_check.sh
echo     apt install -y nginx >> temp_env_check.sh
echo     systemctl start nginx >> temp_env_check.sh
echo     systemctl enable nginx >> temp_env_check.sh
echo fi >> temp_env_check.sh
echo. >> temp_env_check.sh
echo # 检查并安装 PM2 >> temp_env_check.sh
echo if ! command -v pm2 ^&^> /dev/null; then >> temp_env_check.sh
echo     echo "安装 PM2..." >> temp_env_check.sh
echo     npm install -g pm2 >> temp_env_check.sh
echo fi >> temp_env_check.sh
echo. >> temp_env_check.sh
echo echo "环境检查完成" >> temp_env_check.sh

REM 上传并执行环境检查脚本
scp temp_env_check.sh root@%SERVER_IP%:/tmp/
ssh root@%SERVER_IP% "chmod +x /tmp/temp_env_check.sh && /tmp/temp_env_check.sh"
del temp_env_check.sh >nul 2>&1

echo %GREEN%[SUCCESS]%NC% 服务器环境准备完成

REM 创建项目目录
echo %BLUE%[INFO]%NC% 创建项目目录...
ssh root@%SERVER_IP% "mkdir -p %REMOTE_PATH%/{frontend,server,data/pictures}"

REM 上传后端代码
echo %BLUE%[INFO]%NC% 上传后端代码...
scp -r %SERVER_DIR%/* root@%SERVER_IP%:%REMOTE_PATH%/server/

REM 上传前端构建文件
echo %BLUE%[INFO]%NC% 上传前端文件...
scp -r %LOCAL_BUILD_DIR%/* root@%SERVER_IP%:%REMOTE_PATH%/frontend/

REM 创建服务器配置脚本
echo %BLUE%[INFO]%NC% 配置服务器...

REM 创建服务器配置脚本
echo set -e > temp_server_config.sh
echo. >> temp_server_config.sh
echo # 安装后端依赖 >> temp_server_config.sh
echo cd %REMOTE_PATH%/server >> temp_server_config.sh
echo npm install --production >> temp_server_config.sh
echo. >> temp_server_config.sh
echo # 创建环境配置文件 >> temp_server_config.sh
echo if [ ! -f .env ]; then >> temp_server_config.sh
echo     cat ^> .env ^<^< EOF >> temp_server_config.sh
echo # 服务端口 >> temp_server_config.sh
echo PORT=3001 >> temp_server_config.sh
echo. >> temp_server_config.sh
echo # 数据存储目录 >> temp_server_config.sh
echo DATA_DIR="%REMOTE_PATH%/data" >> temp_server_config.sh
echo. >> temp_server_config.sh
echo # 数据库文件名 >> temp_server_config.sh
echo DB_FILE="battery-swap-station-data.json" >> temp_server_config.sh
echo. >> temp_server_config.sh
echo # 图片存储目录 >> temp_server_config.sh
echo PICTURES_DIR="/pictures" >> temp_server_config.sh
echo. >> temp_server_config.sh
echo # 最大JSON文件大小 ^(单位: MB^) >> temp_server_config.sh
echo MAX_FILE_SIZE=5 >> temp_server_config.sh
echo. >> temp_server_config.sh
echo # 日志级别 >> temp_server_config.sh
echo LOG_LEVEL="info" >> temp_server_config.sh
echo EOF >> temp_server_config.sh
echo fi >> temp_server_config.sh
echo. >> temp_server_config.sh
echo # 设置目录权限 >> temp_server_config.sh
echo chown -R www-data:www-data %REMOTE_PATH%/data >> temp_server_config.sh
echo chmod -R 755 %REMOTE_PATH%/data >> temp_server_config.sh
echo. >> temp_server_config.sh
echo # 启动PM2服务 >> temp_server_config.sh
echo cd %REMOTE_PATH%/server >> temp_server_config.sh
echo if pm2 describe charging-station-api ^> /dev/null 2^>^&1; then >> temp_server_config.sh
echo     echo "重启现有服务..." >> temp_server_config.sh
echo     pm2 restart charging-station-api >> temp_server_config.sh
echo else >> temp_server_config.sh
echo     echo "启动新服务..." >> temp_server_config.sh
echo     pm2 start app.js --name charging-station-api >> temp_server_config.sh
echo     pm2 startup >> temp_server_config.sh
echo     pm2 save >> temp_server_config.sh
echo fi >> temp_server_config.sh
echo. >> temp_server_config.sh
echo echo "服务器配置完成" >> temp_server_config.sh

REM 上传并执行服务器配置脚本
scp temp_server_config.sh root@%SERVER_IP%:/tmp/
ssh root@%SERVER_IP% "chmod +x /tmp/temp_server_config.sh && /tmp/temp_server_config.sh"
del temp_server_config.sh >nul 2>&1

REM 配置Nginx
echo %BLUE%[INFO]%NC% 配置 Nginx...
echo server { > temp_nginx.conf
echo     listen 80; >> temp_nginx.conf
echo     server_name %DOMAIN_NAME%; >> temp_nginx.conf
echo. >> temp_nginx.conf
echo     # 前端静态文件 >> temp_nginx.conf
echo     location / { >> temp_nginx.conf
echo         root %REMOTE_PATH%/frontend; >> temp_nginx.conf
echo         index index.html; >> temp_nginx.conf
echo         try_files $uri $uri/ /index.html; >> temp_nginx.conf
echo. >> temp_nginx.conf
echo         # 缓存静态资源 >> temp_nginx.conf
echo         location ~* \.(js^|css^|png^|jpg^|jpeg^|gif^|ico^|svg^)$ { >> temp_nginx.conf
echo             expires 1y; >> temp_nginx.conf
echo             add_header Cache-Control "public, immutable"; >> temp_nginx.conf
echo         } >> temp_nginx.conf
echo     } >> temp_nginx.conf
echo. >> temp_nginx.conf
echo     # API 代理 >> temp_nginx.conf
echo     location /api/ { >> temp_nginx.conf
echo         proxy_pass http://localhost:3001/; >> temp_nginx.conf
echo         proxy_http_version 1.1; >> temp_nginx.conf
echo         proxy_set_header Upgrade $http_upgrade; >> temp_nginx.conf
echo         proxy_set_header Connection 'upgrade'; >> temp_nginx.conf
echo         proxy_set_header Host $host; >> temp_nginx.conf
echo         proxy_set_header X-Real-IP $remote_addr; >> temp_nginx.conf
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; >> temp_nginx.conf
echo         proxy_set_header X-Forwarded-Proto $scheme; >> temp_nginx.conf
echo         proxy_cache_bypass $http_upgrade; >> temp_nginx.conf
echo     } >> temp_nginx.conf
echo. >> temp_nginx.conf
echo     # 图片资源代理 >> temp_nginx.conf
echo     location /pictures/ { >> temp_nginx.conf
echo         proxy_pass http://localhost:3001/pictures/; >> temp_nginx.conf
echo         proxy_set_header Host $host; >> temp_nginx.conf
echo         proxy_set_header X-Real-IP $remote_addr; >> temp_nginx.conf
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; >> temp_nginx.conf
echo     } >> temp_nginx.conf
echo } >> temp_nginx.conf

scp temp_nginx.conf root@%SERVER_IP%:/etc/nginx/sites-available/charging-station
ssh root@%SERVER_IP% "ln -sf /etc/nginx/sites-available/charging-station /etc/nginx/sites-enabled/ && nginx -t && systemctl restart nginx"
del temp_nginx.conf >nul 2>&1

echo %GREEN%[SUCCESS]%NC% 部署完成！

REM 检查服务状态
echo %BLUE%[INFO]%NC% 检查服务状态...
ssh root@%SERVER_IP% "echo '=== PM2 服务状态 ===' && pm2 status && echo '' && echo '=== Nginx 状态 ===' && systemctl status nginx --no-pager -l && echo '' && echo '=== 端口监听状态 ===' && netstat -tlnp | grep -E ':(80|3001)\s'"

echo.
echo %GREEN%[SUCCESS]%NC% 🎉 部署成功完成！
echo %BLUE%[INFO]%NC%
echo %BLUE%[INFO]%NC% 访问地址:
echo %BLUE%[INFO]%NC%   HTTP:  http://%DOMAIN_NAME%
echo %BLUE%[INFO]%NC%   API:   http://%DOMAIN_NAME%/api

if not "%DOMAIN_NAME%"=="%SERVER_IP%" (
    echo %YELLOW%[WARNING]%NC%
    echo %YELLOW%[WARNING]%NC% ⚠️  请确保域名 %DOMAIN_NAME% 已正确解析到服务器 IP: %SERVER_IP%
)

echo %BLUE%[INFO]%NC%
echo %BLUE%[INFO]%NC% 📋 后续操作建议:
echo %BLUE%[INFO]%NC%   1. 配置 HTTPS: sudo certbot --nginx -d %DOMAIN_NAME%
echo %BLUE%[INFO]%NC%   2. 设置防火墙: sudo ufw allow 80 ^&^& sudo ufw allow 443
echo %BLUE%[INFO]%NC%   3. 监控日志: ssh root@%SERVER_IP% 'pm2 logs'
echo %BLUE%[INFO]%NC%   4. 查看详细部署指南: 阿里云部署指南.md

echo %GREEN%[SUCCESS]%NC%
echo %GREEN%[SUCCESS]%NC% ✅ 部署脚本执行完成！

pause