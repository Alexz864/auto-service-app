import { Router } from 'express';
import * as carController from '../controllers/carController';
import * as appointmentController from '../controllers/appointmentController';

const router = Router();

router.get('/', (req, res, next) => {
    carController.getAllCars(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
    carController.getCarById(req, res).catch(next);
});

router.get('/client/:clientId', (req, res, next) => {
    carController.getCarsByClientId(req, res).catch(next);
});

router.post('/', (req, res, next) => {
    carController.createCar(req, res).catch(next);
});

router.put('/:id', (req, res, next) => {
    carController.updateCar(req, res).catch(next);
});

router.patch('/:id/deactivate', (req, res, next) => {
    carController.deactivateCar(req, res).catch(next);
});

router.patch('/:id/reactivate', (req, res, next) => {
    carController.reactivatecar(req, res).catch(next);
});

router.get('/:id/appointments', (req, res, next) => {
    appointmentController.getAppointmentsByCarId(req, res).catch(next);
});

router.delete('/:id', (req, res, next) => {
    carController.deleteCar(req, res).catch(next);
  });


export default router;