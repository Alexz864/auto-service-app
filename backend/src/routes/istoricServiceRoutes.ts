import { Router} from 'express';
import * as carReceiveController from '../controllers/carReceiveController';
import * as carProcessingController from '../controllers/carProcessingController';
import * as istoricServiceController from '../controllers/istoricServiceController';

const router = Router();

router.get('/', (req, res, next) => {
  istoricServiceController.getAllIstoric(req, res).catch(next);
});

router.post('/', (req, res, next) => {
  istoricServiceController.createIstoric(req, res).catch(next);
});

router.get('/receives', (req, res, next) => {
  carReceiveController.getAllReceives(req, res).catch(next);
});

router.post('/receives', (req, res, next) => {
  carReceiveController.createReceive(req, res).catch(next);
});

router.get('/processings', (req, res, next) => {
  carProcessingController.getAllProcessings(req, res).catch(next);
});

router.post('/processings', (req, res, next) => {
  carProcessingController.createProcessing(req, res).catch(next);
});

router.get('/receives/appointment/:appointmentId', (req, res, next) => {
  carReceiveController.getReceiveByAppointmentId(req, res).catch(next);
});

router.get('/processings/appointment/:appointmentId', (req, res, next) => {
  carProcessingController.getProcessingByAppointmentId(req, res).catch(next);
});

router.get('/processings/:id/part', (req, res, next) => {
  istoricServiceController.getProcessingParts(req, res).catch(next);
});

router.get('/receives/:id', (req, res, next) => {
  carReceiveController.getReceiveById(req, res).catch(next);
});

router.put('/receives/:id', (req, res, next) => {
  carReceiveController.updateReceive(req, res).catch(next);
});

router.get('/processings/:id', (req, res, next) => {
  carProcessingController.getProcessingById(req, res).catch(next);
});

router.put('/processings/:id', (req, res, next) => {
  carProcessingController.updateProcessing(req, res).catch(next);
});

router.post('/processings/:id/part', (req, res, next) => {
  carProcessingController.addPartToProcessing(req, res).catch(next);
});

router.delete('/processings/:processingId/part/:partId', (req, res, next) => {
  carProcessingController.removePartFromProcessing(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  istoricServiceController.getIstoricById(req, res).catch(next);
});

router.put('/:id/receive/:receiveId', (req, res, next) => {
  carReceiveController.updateReceive(req, res).catch(next);
});

router.put('/:id/processing/:processingId', (req, res, next) => {
  carProcessingController.updateProcessing(req, res).catch(next);
});

router.post('/:id/receive', (req, res, next) => {
  istoricServiceController.addReceiveToIstoric(req, res).catch(next);
});

router.post('/:id/processing', (req, res, next) => {
  istoricServiceController.addProcessingToIstoric(req, res).catch(next);
});

router.patch('/:id/status', (req, res, next) => {
  istoricServiceController.updateIstoricStatus(req, res).catch(next);
});

export default router;