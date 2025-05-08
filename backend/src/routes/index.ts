import { Router } from 'express';
import clientRoutes from './clientRoutes';
import carRoutes from './carRoutes';
import partRoutes from './partRoutes';
import appointmentRoutes from './appointmentRoutes';
import istoricServiceRoutes from './istoricServiceRoutes';

const router = Router();

router.use('/clients', clientRoutes);
router.use('/cars', carRoutes);
router.use('/parts', partRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/istoric-service', istoricServiceRoutes);

export default router;