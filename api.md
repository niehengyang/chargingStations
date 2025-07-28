# 充电站API接口文档

## 基础信息
- **基础URL**: `http://localhost:3001`
- **响应格式**: JSON
- **状态码说明**:
  - `0`: 成功
  - `1`: 失败

## 接口列表

### 1. 获取所有站点

#### 请求信息
- **URL**: `/station`
- **方法**: GET
- **参数**: 无

#### 成功响应
```json
{
  "status": 0,
  "message": "获取成功",
  "data": [
    {
      "id": "BSS001",
      "name": "站点名称",
      "stationType": "电动自行车换电站",
      "coordinates": {
        "latitude": 39.9042,
        "longitude": 116.4074
      },
      // 其他字段...
    }
  ]
}
```

### 2. 获取单个站点

#### 请求信息
- **URL**: `/station/:id`
- **方法**: GET
- **路径参数**:
  | 参数 | 类型 | 描述 |
  |------|------|------|
  | `id` | String | 站点ID，如BSS001 |

#### 成功响应
```json
{
  "status": 0,
  "message": "获取成功",
  "data": {
    "id": "BSS001",
    "name": "站点名称",
    "stationType": "电动自行车换电站",
    "coordinates": {
      "latitude": 39.9042,
      "longitude": 116.4074
    },
    "address": "详细地址",
    "province": "省份",
    "city": "城市",
    "district": "区/县",
    "status": "运营中",
    "basicInfo": {
      "owner": "所有者",
      "operator": "运营商",
      "contactPhone": "联系电话",
      "establishmentDate": "2023-01-01"
    },
    "photos": [/* 照片信息 */],
    "batteryCabinets": [/* 电池柜信息 */],
    "description": "站点描述",
    "serviceRadius": 1000
  }
}
```

#### 失败响应
```json
{
  "status": 1,
  "message": "站点不存在",
  "error": "详细错误信息"
}
```

### 3. 创建站点

#### 请求信息
- **URL**: `/station`
- **方法**: POST
- **Content-Type**: `multipart/form-data`
- **表单字段**:

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| `name` | String | 是 | 站点名称 |
| `coordinates[latitude]` | Number | 是 | 纬度坐标 |
| `coordinates[longitude]` | Number | 是 | 经度坐标 |
| `address` | String | 否 | 详细地址 |
| `province` | String | 否 | 省份 |
| `city` | String | 否 | 城市 |
| `district` | String | 否 | 区/县 |
| `stationType` | String | 否 | 站点类型，默认："电动自行车换电站" |
| `status` | String | 否 | 运营状态，默认："运营中" |
| `description` | String | 否 | 站点描述 |
| `serviceRadius` | Number | 否 | 服务半径，单位：米 |
| `basicInfo[owner]` | String | 否 | 所有者 |
| `basicInfo[operator]` | String | 否 | 运营商 |
| `basicInfo[contactPhone]` | String | 否 | 联系电话 |
| `batteryCabinets[0][supplier]` | String | 否 | 电池柜供应商 |
| `batteryCabinets[0][batteryCount]` | Number | 否 | 电池数量 |
| `photos` | File[] | 否 | 站点照片，支持多张 |

#### 成功响应
```json
{
  "status": 0,
  "message": "站点创建成功",
  "data": {
    "id": "BSS001",
    "name": "站点名称",
    // 其他字段与请求参数对应...
  }
}
```

### 4. 更新站点

#### 请求信息
- **URL**: `/station/:id`
- **方法**: PUT
- **路径参数**:
  | 参数 | 类型 | 描述 |
  |------|------|------|
  | `id` | String | 站点ID |
- **请求体** (JSON):
  可包含创建站点时的所有字段（除id外），仅提供需要更新的字段

#### 成功响应
```json
{
  "status": 0,
  "message": "站点更新成功",
  "data": {
    "id": "BSS001",
    // 更新后的完整站点信息...
  }
}
```

### 5. 删除站点

#### 请求信息
- **URL**: `/station/:id`
- **方法**: DELETE
- **路径参数**:
  | 参数 | 类型 | 描述 |
  |------|------|------|
  | `id` | String | 站点ID |

#### 成功响应
```json
{
  "status": 0,
  "message": "站点删除成功"
}
```

## 调用示例

### 获取所有站点 (curl)
```bash
curl -X GET http://localhost:3001/station
```

### 创建站点 (curl)
```bash
curl -X POST http://localhost:3001/station \
  -H "Content-Type: multipart/form-data" \
  -F "name=测试站点" \
  -F "coordinates[latitude]=39.9042" \
  -F "coordinates[longitude]=116.4074" \
  -F "photos=@/path/to/photo.jpg"
```