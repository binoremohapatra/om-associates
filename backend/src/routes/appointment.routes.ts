import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', AppointmentController.getAppointments);
router.post('/', AppointmentController.scheduleAppointment);

export default router;
