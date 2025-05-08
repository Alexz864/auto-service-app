import { Request, Response } from 'express';
import { ReceiveCar, Appointment } from '../models';

export const createReceive = async (req: Request, res: Response): Promise<Response> => {

  const { appointmentId, visualProblems, clientReportedProblems, purpose } = req.body;
  
  if (!appointmentId || !purpose) {
    return res.status(400).json({ message: 'ID-ul programării și scopul vizitei sunt obligatorii.' });
  }
  
  if (!['verificare', 'revizie', 'reparatie'].includes(purpose)) {
    return res.status(400).json({ message: 'Scop vizită invalid. Valorile acceptate sunt: verificare, revizie, reparatie.' });
  }
  
  try {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită.' });
    }
    
    const existingReceive = await ReceiveCar.findOne({ where: { appointmentId } });
    if (existingReceive) {
      return res.status(400).json({ message: 'Există deja o primire pentru această programare.' });
    }
    
    await appointment.update({ status: 'in lucru' });
    
    const newReceive = await ReceiveCar.create({
      appointmentId,
      visualProblems: visualProblems || '',
      clientReportedProblems: clientReportedProblems || '',
      purpose
    });
    
    return res.status(201).json(newReceive);
  } catch (error) {
    console.error('Eroare la crearea primirii:', error);
    return res.status(500).json({ message: 'Eroare la crearea primirii.' });
  }
};

export const getAllReceives = async (req: Request, res: Response): Promise<Response> => {

  try {
    const receives = await ReceiveCar.findAll({
      include: [{ model: Appointment }],
    });

    return res.json(receives);
  } catch (error) {
    console.error('Eroare la obținerea primirilor:', error);
    return res.status(500).json({ message: 'Eroare la obținerea primirilor.' });
  }
};

export const getReceiveById = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;

  try {
    const receive = await ReceiveCar.findByPk(id, {
      include: [{ model: Appointment }],
    });
    
    if (!receive) {
      return res.status(404).json({ message: 'Primirea nu a fost găsită.' });
    }
    
    return res.json(receive);
  } catch (error) {
    console.error(`Eroare la obținerea primirii cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea primirii cu id ${id}.` });
  }
};

export const getReceiveByAppointmentId = async (req: Request, res: Response): Promise<Response> => {

  const { appointmentId } = req.params;

  try {
    const receive = await ReceiveCar.findOne({
      where: { appointmentId },
      include: [{ model: Appointment }],
    });
    
    if (!receive) {
      return res.status(404).json({ message: 'Primirea nu a fost găsită pentru această programare.' });
    }
    
    return res.json(receive);
  } catch (error) {
    console.error(`Eroare la obținerea primirii pentru programarea cu id ${appointmentId}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea primirii pentru programarea cu id ${appointmentId}.` });
  }
};

export const updateReceive = async (req: Request, res: Response): Promise<Response> => {

  const { receiveId } = req.params;
  const { visualProblems, clientReportedProblems, purpose } = req.body;
  
  try {
    const receive = await ReceiveCar.findByPk(receiveId);
    
    if (!receive) {
      return res.status(404).json({ message: 'Primirea nu a fost găsită.' });
    }
    
    await receive.update({
      visualProblems: visualProblems || receive.visualProblems,
      clientReportedProblems: clientReportedProblems || receive.clientReportedProblems,
      purpose: purpose || receive.purpose
    });
    
    return res.json(receive);
  } catch (error) {
    console.error(`Eroare la actualizarea primirii cu id ${receiveId}:`, error);
    return res.status(500).json({ message: `Eroare la actualizarea primirii cu id ${receiveId}.` });
  }
};