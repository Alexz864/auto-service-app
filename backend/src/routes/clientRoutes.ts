import { Router } from 'express';
import * as clientController from '../controllers/clientController';
import * as carController from '../controllers/carController';
import * as appointmentController from '../controllers/appointmentController';

const router = Router();

router.get('/', (req, res, next) => {
    clientController.getAllClients(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
    clientController.getClientById(req, res).catch(next);
});

router.post('/', (req, res, next) => {
    clientController.createClient(req, res).catch(next);
});

router.put('/:id', (req, res, next) => {
    clientController.updateClient(req, res).catch(next);
});

router.patch('/:id/deactivate', (req, res, next) => {
    clientController.deactivateClient(req, res).catch(next);
});

router.patch('/:id/activate', (req, res, next) => {
    clientController.reactivateClient(req, res).catch(next);
});

router.get('/:id/cars', (req, res, next) => {
    carController.getCarsByClientId(req, res).catch(next);
});

router.get('/:id/appointments', (req, res, next) => {
    appointmentController.getAppointmentsByClientId(req, res).catch(next);
});

router.delete('/:id', (req, res, next) => {
    clientController.deleteClient(req, res).catch(next);
  });

export default router;