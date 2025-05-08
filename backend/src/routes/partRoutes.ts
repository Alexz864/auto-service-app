import { Router } from 'express';
import * as partController from '../controllers/partController';
import * as appointmentController from '../controllers/appointmentController';

const router = Router();

router.get('/verify-disponibility', (req, res, next) => {
    appointmentController.verifyDisponibility(req, res).catch(next);
  });

router.get('/', (req, res, next) => {
    partController.getAllParts(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
    partController.getPartById(req, res).catch(next);
});

router.post('/', (req, res, next) => {
    partController.createPart(req, res).catch(next);
});

router.put('/:id', (req, res, next) => {
    partController.updatePart(req, res).catch(next);
});

router.patch('/:id/deactivate', (req, res, next) => {
    partController.deactivatePart(req, res).catch(next);
});

router.patch('/:id/reactivate', (req, res, next) => {
    partController.reactivatePart(req, res).catch(next);
});

router.patch('/:id/updateStock', (req, res, next) => {
    partController.updateStock(req, res).catch(next);
});

  router.delete('/:id', (req, res, next) => {
    partController.deletePart(req, res).catch(next);
});

export default router;