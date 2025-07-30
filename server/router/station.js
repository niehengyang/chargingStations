import { Router } from 'express';
const router = Router();

// 导入路由处理函数模块
import { getAllStations, getStationById, createStation, updateStation, deleteStation, healthCheck, addPhotoToStation, getStationPhoto, deleteStationPhoto } from '../router_handler/station.js';

// 定义CRUD路由
router.get('/health', healthCheck);
router.get('/', getAllStations);
router.get('/:id', getStationById);
router.post('/', createStation);
router.put('/:id', updateStation);
router.delete('/:id', deleteStation);

// 照片相关路由
router.post('/:id/photos', addPhotoToStation);
router.get('/:id/photos/:filename', getStationPhoto);
router.delete('/:id/photos/:photoId', deleteStationPhoto);

export default router;
