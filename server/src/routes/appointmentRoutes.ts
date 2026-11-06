import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
} from '../controllers/appointmentController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createAppointmentSchema, updateAppointmentStatusSchema } from '../validators/schemas';

const router = Router();

router.post('/', authenticate, authorize('customer'), validateRequest(createAppointmentSchema), createAppointment);
router.get('/', authenticate, getAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.patch('/:id/status', authenticate, validateRequest(updateAppointmentStatusSchema), updateAppointmentStatus);
router.delete('/:id', authenticate, deleteAppointment);

export default router;

