import { Router } from 'express'
// 创建路由对象
const router = Router()

// 导入用户路由处理函数模块
import { list } from '../router_handler/station.js'

// 列表
router.post('/list', list)

export default router
