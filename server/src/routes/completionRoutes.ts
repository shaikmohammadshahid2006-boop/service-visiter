import { Router } from 'express';
import {
  requestCompletion,
  approveCompletion,
  reportIssueCompletion,
  getCompletionApprovals,
} from '../controllers/completionController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  requestCompletionSchema,
  approveCompletionSchema,
  reportIssueCompletionSchema,
} from '../validators/schemas';

const router = Router();

router.get('/', authenticate, getCompletionApprovals);
router.post('/:workOrderId/request', authenticate, validateRequest(requestCompletionSchema), requestCompletion);
router.post('/:workOrderId/approve', authenticate, validateRequest(approveCompletionSchema), approveCompletion);
router.post('/:workOrderId/report-issue', authenticate, validateRequest(reportIssueCompletionSchema), reportIssueCompletion);

export default router;

