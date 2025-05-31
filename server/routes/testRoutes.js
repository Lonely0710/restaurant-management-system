import express from 'express';
import { runDirtyReadTest, runNonRepeatableReadTest, runLostUpdateTest } from '../controllers/testController.js';

const router = express.Router();

// 定义并发测试相关的路由
router.get('/dirty-read', runDirtyReadTest);
router.get('/non-repeatable-read', runNonRepeatableReadTest);
router.get('/lost-update', runLostUpdateTest);

export default router; 