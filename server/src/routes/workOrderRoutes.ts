import { Router } from 'express';
import {
  getWorkOrders,
  getWorkOrderById,
  updateWorkOrderStatus,
} from '../controllers/workOrderController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getWorkOrders);
router.get('/:id', authenticate, getWorkOrderById);
router.patch('/:id/status', authenticate, updateWorkOrderStatus);

export default router;

