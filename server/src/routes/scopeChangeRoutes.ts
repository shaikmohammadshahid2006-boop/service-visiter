import { Router } from 'express';
import {
  createScopeChange,
  getScopeChangesByWorkOrder,
  getAllScopeChanges,
  decideScopeChange,
} from '../controllers/scopeChangeController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createScopeChangeSchema, decideScopeChangeSchema } from '../validators/schemas';

const router = Router();

router.post('/', authenticate, validateRequest(createScopeChangeSchema), createScopeChange);
router.get('/', authenticate, getAllScopeChanges);
router.get('/:workOrderId', authenticate, getScopeChangesByWorkOrder);
router.patch('/:id/decision', authenticate, validateRequest(decideScopeChangeSchema), decideScopeChange);

export default router;

