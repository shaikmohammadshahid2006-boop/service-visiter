import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getProviders,
  getProviderById,
} from '../controllers/serviceController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { serviceCategorySchema } from '../validators/schemas';

const router = Router();

router.get('/categories', getServices);
router.get('/categories/:id', getServiceById);
router.post('/categories', authenticate, authorize('admin'), validateRequest(serviceCategorySchema), createService);
router.put('/categories/:id', authenticate, authorize('admin'), updateService);
router.delete('/categories/:id', authenticate, authorize('admin'), deleteService);

// Providers list and profile
router.get('/providers', getProviders);
router.get('/providers/:id', getProviderById);

// Aliases for /api/services
router.get('/', getServices);
router.post('/', authenticate, authorize('admin'), validateRequest(serviceCategorySchema), createService);
router.put('/:id', authenticate, authorize('admin'), updateService);
router.delete('/:id', authenticate, authorize('admin'), deleteService);

export default router;

