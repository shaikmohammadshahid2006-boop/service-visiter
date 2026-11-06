import { Router } from 'express';
import {
  createDispute,
  getDisputes,
  getDisputeById,
  addDisputeMessage,
  updateDispute,
} from '../controllers/disputeController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  createDisputeSchema,
  addDisputeMessageSchema,
  resolveDisputeSchema,
} from '../validators/schemas';

const router = Router();

router.post('/', authenticate, validateRequest(createDisputeSchema), createDispute);
router.get('/', authenticate, getDisputes);
router.get('/:id', authenticate, getDisputeById);
router.post('/:id/messages', authenticate, validateRequest(addDisputeMessageSchema), addDisputeMessage);
router.patch('/:id', authenticate, updateDispute);

export default router;

