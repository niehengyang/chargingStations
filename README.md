# 🔋 充电站管理系统

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.5.17-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.10.4-409EFF?style=for-the-badge&logo=element&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)

**一个基于 Vue 3 + TypeScript + 高德地图的现代化充电站/换电站管理系统**

[🚀 快速开始](#-快速开始) • [📖 功能特性](#-功能特性) • [🛠️ 技术栈](#️-技术栈) • [📁 项目结构](#-项目结构) • [🔧 开发指南](#-开发指南)

</div>

---

## 📖 功能特性

### 🗺️ 地图功能
- **智能地图展示** - 基于高德地图的交互式地图界面
- **多样式地图** - 支持标准、卫星、路况等多种地图样式
- **精准定位** - 支持地图点击选择位置和坐标显示
- **地图搜索** - 集成地点搜索和位置选择功能
- **路线规划** - 智能路径规划和导航功能

### 🔋 站点管理
- **站点可视化** - 地图上直观显示所有充电站/换电站位置
- **详细信息** - 展示站点状态、服务范围、设备信息等
- **CRUD操作** - 完整的站点创建、编辑、删除功能
- **照片管理** - 支持站点照片上传、查看和管理
- **状态监控** - 实时显示站点运营状态（运营中/维护中/暂停服务/建设中）

### 📊 数据管理
- **列表视图** - 经典表格形式的站点数据管理
- **搜索过滤** - 支持按名称、地址、区县等条件筛选
- **分页展示** - 高效的数据分页加载
- **批量操作** - 支持批量数据处理

### 🎨 用户体验
- **响应式设计** - 适配各种屏幕尺寸
- **现代化UI** - 基于 Element Plus 的美观界面
- **圆形菜单** - 创新的悬浮式操作菜单
- **实时反馈** - 操作状态的即时反馈

## 🛠️ 技术栈

### 前端技术
- **框架**: Vue 3.5.17 (Composition API + `<script setup>`)
- **语言**: TypeScript 5.8.3
- **构建工具**: Vite 7.0.4
- **UI框架**: Element Plus 2.10.4
- **地图服务**: 高德地图 (@vuemap/vue-amap)
- **状态管理**: Pinia 3.0.3
- **路由**: Vue Router 4.5.1
- **HTTP客户端**: Axios 1.11.0
- **样式预处理**: Sass

### 后端技术
- **运行时**: Node.js
- **框架**: Express 5.1.0
- **文件上传**: Multer 2.0.2
- **跨域处理**: CORS 2.8.5
- **环境配置**: Dotenv 17.2.1
- **日志美化**: Chalk 5.4.1

### 开发工具
- **代码检查**: ESLint + TypeScript
- **自动导入**: unplugin-auto-import
- **组件自动注册**: unplugin-vue-components
- **兼容性**: @vitejs/plugin-legacy

## 📁 项目结构

```
chargingStationWeb/
├── 📁 src/                    # 前端源码
│   ├── 📁 assets/             # 静态资源
│   │   ├── 📁 iconfonts/      # 图标字体
│   │   ├── 📁 images/         # 图片资源
│   │   └── 📁 styles/         # 样式文件
│   ├── 📁 components/         # 公共组件
│   │   ├── 📄 CircleMenu.vue      # 圆形菜单组件
│   │   ├── 📄 CustomMarker.vue    # 自定义地图标记
│   │   ├── 📄 MapPicker.vue       # 地图位置选择器
│   │   ├── 📄 MapSearch.vue       # 地图搜索组件
│   │   ├── 📄 MapStyleSelector.vue # 地图样式选择器
│   │   ├── 📄 MarkerInfo.vue      # 标记信息弹窗
│   │   ├── 📄 RoutePlanner.vue    # 路线规划组件
│   │   ├── 📄 Sidebar.vue         # 侧边栏组件
│   │   ├── 📄 StationCreator.vue  # 站点创建器
│   │   └── 📄 StationEditor.vue   # 站点编辑器
│   ├── 📁 config/             # 配置文件
│   │   └── 📄 env.ts              # 环境配置
│   ├── 📁 request/            # HTTP请求配置
│   ├── 📁 router/             # 路由配置
│   ├── 📁 stores/             # Pinia状态管理
│   ├── 📁 types/              # TypeScript类型定义
│   │   └── 📄 charging-station.ts # 充电站类型定义
│   ├── 📁 utils/              # 工具函数
│   │   ├── 📁 api/            # API接口
│   │   │   └── 📄 station-api.ts  # 站点API
│   │   └── 📄 photo-utils.ts      # 照片处理工具
│   ├── 📁 views/              # 页面组件
│   │   ├── 📁 home/           # 首页
│   │   │   └── 📄 Index.vue       # 地图主页
│   │   └── 📁 stations/       # 站点管理
│   │       └── 📄 List.vue        # 站点列表页
│   └── 📄 main.ts             # 应用入口
├── 📁 server/                 # 后端服务
│   ├── 📁 config/             # 服务器配置
│   │   └── 📄 env.js              # 环境变量配置
│   ├── 📁 data/               # 数据存储
│   │   ├── 📄 battery-swap-station-data.json # 站点数据
│   │   └── 📁 pictures/           # 图片存储
│   ├── 📁 router/             # 路由定义
│   │   └── 📄 station.js          # 站点路由
│   ├── 📁 router_handler/     # 路由处理器
│   │   └── 📄 station.js          # 站点业务逻辑
│   ├── 📁 utils/              # 工具函数
│   │   ├── 📄 dataHandler.js      # 数据处理
│   │   └── 📄 logger.js           # 日志工具
│   ├── 📄 app.js              # 服务器入口
│   └── 📄 package.json        # 后端依赖
├── 📄 .env.dev                # 开发环境配置
├── 📄 .env.pro                # 生产环境配置
├── 📄 vite.config.ts          # Vite配置
├── 📄 tsconfig.json           # TypeScript配置
└── 📄 package.json            # 前端依赖
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd chargingStationWeb

# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 环境配置

1. **配置高德地图API**
   ```bash
   # 复制环境配置文件
   cp .env.dev .env
   
   # 编辑 .env 文件，添加高德地图密钥
   VITE_AMAP_KEY=your_amap_key_here
   VITE_AMAP_SECURITY_JS_CODE=your_security_code_here
   ```

2. **配置后端服务**
   ```bash
   # 进入服务器目录
   cd server
   
   # 复制环境配置
   cp .env.example .env
   
   # 根据需要修改配置
   ```

### 启动开发服务

```bash
# 启动后端服务 (端口: 3001)
cd server
node app.js

# 新开终端，启动前端开发服务 (端口: 5174)
cd ..
npm run dev
```

### 访问应用
- **前端应用**: http://localhost:5174
- **后端API**: http://localhost:3001
- **API健康检查**: http://localhost:3001/station/health

## 🔧 开发指南

### 可用脚本

```bash
# 前端开发
npm run dev          # 开发模式 (开发环境)
npm run test         # 测试模式 (测试环境)
npm run pro          # 生产模式 (生产环境)

# 构建打包
npm run build:dev    # 构建开发版本
npm run build:test   # 构建测试版本
npm run build:pro    # 构建生产版本

# 预览构建结果
npm run preview      # 预览构建后的应用
```

### API接口

#### 站点管理
- `GET /station` - 获取所有站点
- `GET /station/:id` - 获取指定站点
- `POST /station` - 创建新站点
- `PUT /station/:id` - 更新站点信息
- `DELETE /station/:id` - 删除站点

#### 照片管理
- `POST /station/:id/photos` - 上传站点照片
- `GET /station/:id/photos/:filename` - 获取站点照片
- `DELETE /station/:id/photos/:photoId` - 删除站点照片

#### 系统监控
- `GET /station/health` - 健康检查

### 数据结构

#### 充电站/换电站数据模型
```typescript
interface BatterySwapStation {
  id: string;                    // 站点ID
  name: string;                  // 站点名称
  stationType: string;           // 站点类型
  coordinates: {                 // 坐标信息
    latitude: number;
    longitude: number;
  };
  address: string;               // 详细地址
  province: string;              // 省份
  city: string;                  // 城市
  district: string;              // 区县
  status: string;                // 运营状态
  serviceRadius: number;         // 服务半径(公里)
  basicInfo: BasicInfo;          // 基本信息
  photos: Photo[];               // 站点照片
  batteryCabinets: BatteryCabinet[]; // 电池柜信息
  description: string;           // 描述信息
}
```

### 开发规范

1. **代码风格**
   - 使用 TypeScript 进行类型检查
   - 遵循 Vue 3 Composition API 最佳实践
   - 使用 `<script setup>` 语法糖

2. **组件开发**
   - 组件名使用 PascalCase
   - Props 定义明确的类型
   - 使用 defineEmits 定义事件

3. **API调用**
   - 统一使用 axios 进行HTTP请求
   - 错误处理和加载状态管理
   - 类型安全的API响应处理

## 🌟 核心特性详解

### 地图集成
- 集成高德地图 JavaScript API
- 支持地图样式切换（标准、卫星、路况等）
- 自定义标记点和信息窗口
- 地理编码和逆地理编码
- 路径规划和导航

### 状态管理
- 使用 Pinia 进行状态管理
- 支持状态持久化
- 模块化的 store 设计

### 响应式设计
- 移动端友好的界面设计
- 自适应布局和组件
- 触摸友好的交互体验

## 📝 更新日志

### v1.0.0 (2024-01-30)
- ✨ 初始版本发布
- 🗺️ 集成高德地图功能
- 🔋 完整的站点管理系统
- 📱 响应式界面设计
- 🖼️ 照片上传和管理功能
- 🔍 地图搜索和路线规划

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 📧 Email: [790227542@qq.com](mailto:790227542@qq.com)
- 🐛 Issues: [GitHub Issues](https://github.com/niehengyang/chargingStationWeb/issues)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个星标！**

 Made with ❤️ by [Your Name]

</div>
