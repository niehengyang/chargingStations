import { Router } from 'express';
const router = Router();

// 导入路由处理函数模块
import { getAllStations, getStationById, createStation, updateStation, deleteStation, healthCheck } from '../router_handler/station.js';

// 定义CRUD路由
router.get('/health', healthCheck);
router.get('/', getAllStations);
router.get('/:id', getStationById);
router.post('/', createStation);
router.put('/:id', updateStation);
router.delete('/:id', deleteStation);

export default router;
