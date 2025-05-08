import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController';

const router = Router();

router.get('/verify-disponibility', (req, res, next) => {
    appointmentController.verifyDisponibility(req, res).catch(next);
});

router.get('/:id/istoric', (req, res, next) => {
    appointmentController.getAppointmentIstoric(req, res).catch(next);
  });

router.get('/', (req, res, next) => {
    appointmentController.getAllAppointments(req, res).catch(next);
});

router.get('/client/:clientId', (req, res, next) => {
    appointmentController.getAppointmentsByClientId(req, res).catch(next);
});

router.get('/car/:carId', (req, res, next) => {
    appointmentController.getAppointmentsByCarId(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
    appointmentController.getAppointmentById(req, res).catch(next);
});

router.post('/', (req, res, next) => {
    appointmentController.createAppointment(req, res).catch(next);
});

router.put('/:id', (req, res, next) => {
    appointmentController.updateAppointment(req, res).catch(next);
});

router.patch('/:id/status', (req, res, next) => {
    appointmentController.updateAppointmentStatus(req, res).catch(next);
});

router.delete('/:id', (req, res, next) => {
    appointmentController.deleteAppointment(req, res).catch(next);
  })

export default router;