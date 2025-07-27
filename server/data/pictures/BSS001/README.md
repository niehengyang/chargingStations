# 充电站照片目录

## 目录结构

```
public/pictures/
├── CS001/          # 昆明五华区充电站照片
├── CS002/          # 昆明盘龙区充电站照片
├── CS003/          # 昆明官渡区充电站照片
├── CS004/          # 昆明西山区充电站照片
├── CS005/          # 昆明呈贡区充电站照片
├── CS006/          # 昆明经开区充电站照片
├── CS007/          # 昆明高新区充电站照片
├── CS008/          # 昆明滇池度假区充电站照片
├── CS009/          # 昆明长水国际机场充电站照片
├── CS010/          # 昆明火车站充电站照片
├── CS011/          # 昆明五华区电动自行车充电站照片
├── CS012/          # 昆明盘龙区电动自行车充电站照片
├── CS013/          # 昆明官渡区电动自行车充电站照片
├── CS014/          # 昆明呈贡区大学城电动自行车充电站照片
└── CS015/          # 昆明经开区电动自行车充电站照片
```

## 照片命名规范

- `main.jpg` - 充电站主视图
- `charging_area.jpg` - 充电区域
- `facilities.jpg` - 设施照片
- `wireless_charging.jpg` - 无线充电区域
- `smart_system.jpg` - 智能化系统
- `solar_panels.jpg` - 太阳能充电板
- `rest_area.jpg` - 休息区
- `coffee_shop.jpg` - 咖啡厅
- `construction.jpg` - 建设中的充电站
- `scenic_view.jpg` - 风景照片
- `airport_service.jpg` - 机场服务设施
- `taxi_area.jpg` - 出租车专用区域
- `bicycle_area.jpg` - 电动自行车充电区
- `qr_code.jpg` - 扫码充电设备
- `student_area.jpg` - 学生专用区域
- `employee_area.jpg` - 员工专用区域

## 文件格式要求

- 支持格式：JPG、PNG、WebP
- 最大文件大小：10MB
- 推荐尺寸：1920x1080 或更小
- 压缩质量：80%

## 注意事项

1. 所有照片都会在打包时复制到 `dist/pictures/` 目录
2. 照片路径在数据中存储为相对路径，如 `/pictures/CS001/main.jpg`
3. 在生产环境中，照片应该存储在CDN或专门的图片服务器上
4. 开发环境中，照片从 `public/pictures/` 目录加载
