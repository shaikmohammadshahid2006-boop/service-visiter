import { Router } from 'express';
import { createReview, getProviderReviews } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createReview);
router.get('/provider/:providerId', getProviderReviews);

export default router;

