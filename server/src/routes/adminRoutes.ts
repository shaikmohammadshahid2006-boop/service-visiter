import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  toggleUserStatus,
  getRecentActivity,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:userId/status', toggleUserStatus);
router.get('/activity', getRecentActivity);

export default router;

