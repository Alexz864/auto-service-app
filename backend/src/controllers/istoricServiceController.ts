import { Request, Response } from 'express';
import { Appointment, Part, UsedPart, ReceiveCar, ProcessingCar } from '../models';

export const createIstoric = async (req: Request, res: Response): Promise<Response> => {

  try {
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ message: 'ID-ul programării este obligatoriu.' });
    }
    
    const istoric = {
      id: appointmentId, 
      appointmentId,
      receiveCar: null,
      processingCar: null,
      status: 'in lucru',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return res.status(201).json(istoric);
  } catch (error) {
    console.error('Eroare la crearea istoricului:', error);
    return res.status(500).json({ message: 'Eroare la crearea istoricului.'});
  }
};

export const getAllIstoric = async (req: Request, res: Response): Promise<Response> => {

  try {
    //fetch all records from both tables
    const receives = await ReceiveCar.findAll();
    const processings = await ProcessingCar.findAll();
    
    const istoricItems = [];
    
    //for each 'receive' add one element in istoricItems
    for (const receive of receives) {
      istoricItems.push({
        id: receive.id,
        appointmentId: receive.appointmentId,
        receiveCar: receive,
        processingCar: null,
        status: 'in lucru',
        createdAt: receive.createdAt,
        updatedAt: receive.updatedAt
      });
    }

    //for each 'processing' update or create a new element in istoricItems
    for (const processing of processings) {
      const existingIndex = istoricItems.findIndex(item => item.appointmentId === processing.appointmentId);
      
      if (existingIndex !== -1) {
        istoricItems[existingIndex].processingCar = processing;
        istoricItems[existingIndex].status = 'finalizat';
      } else {
        istoricItems.push({
          id: processing.id,
          appointmentId: processing.appointmentId,
          receiveCar: null,
          processingCar: processing,
          status: 'finalizat',
          createdAt: processing.createdAt,
          updatedAt: processing.updatedAt
        });
      }
    }
    
    return res.status(200).json(istoricItems);
  } catch (error) {
    console.error('Eroare la obținerea istoricului:', error);
    return res.status(500).json({ message: 'Eroare la obținerea istoricului.'});
  }
};

export const addReceiveToIstoric = async (req: Request, res: Response): Promise<Response> => {
  
  try {
    const { id } = req.params;
    const receiveData = req.body;

    if (!id) {
      return res.status(400).json({ message: 'ID-ul istoricului este obligatoriu.' });
    }

    const existingReceive = await ReceiveCar.findOne({ 
      where: { appointmentId: id }
    });
    
    if (existingReceive) {
      return res.status(400).json({ 
        message: 'Există deja o primire pentru această programare.' 
      });
    }

    const receive = await ReceiveCar.create({
      appointmentId: parseInt(id),
      visualProblems: receiveData.visualProblems,
      clientReportedProblems: receiveData.clientReportedProblems,
      purpose: receiveData.purpose
    });
    
    return res.status(201).json(receive);
  } catch (error) {
    console.error(`Eroare la adăugarea primirii:`, error);
    return res.status(500).json({ message: `Eroare la adăugarea primirii.`});
  }
};

export const addProcessingToIstoric = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const processingData = req.body;
    
    //check if the appointment exists first
    const appointment = await Appointment.findByPk(parseInt(id));
    if (!appointment) {
      return res.status(404).json({ message: 'Programare negăsită.' });
    }
    
    //create the processing record
    const processing = await ProcessingCar.create({
      appointmentId: parseInt(id),
      operationsDone: processingData.operationsDone,
      foundProblems: processingData.foundProblems,
      solvedProblems: processingData.solvedProblems,
      serviceTime: processingData.serviceTime || 0
    });
    
    //process parts if they exist
    if (processingData.usedParts && Array.isArray(processingData.usedParts) && processingData.usedParts.length > 0) {
      for (const part of processingData.usedParts) {
        if (!part.partId || !part.quantity) {
          continue;
        }
        
        //create 'UsedPart' entries for each part
        await UsedPart.create({
          processingId: processing.id,
          partId: part.partId,
          quantity: part.quantity
        });
        
        //reduce the stock for each used part if needed
        const partRecord = await Part.findByPk(part.partId);
        if (partRecord && partRecord.stock >= part.quantity) {
          await partRecord.update({
            stock: partRecord.stock - part.quantity
          });
        }
      }
    }
    
    //return the created 'ProcessingCar' with parts
    const result = await ProcessingCar.findByPk(processing.id, {
      include: [
        { 
          model: Part,
          through: {
            attributes: ['quantity']
          }
        }
      ]
    });
    
    return res.status(201).json(result);
  } catch (error) {
    console.error(`Eroare la adăugarea procesării:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Eroare necunoscută';
    
    return res.status(500).json({ 
      message: `Eroare la adăugarea procesării: ${errorMessage}`,
      details: error
    });
  }
};

export const updateIstoricStatus = async (req: Request, res: Response): Promise<Response> => {
  
  try {
    const { status } = req.body;
    
    if (!status || !['in lucru', 'finalizat'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status invalid. Valorile acceptate sunt: in lucru, finalizat.' 
      });
    }

    return res.status(200).json({ 
      message: `Statusul a fost actualizat la ${status}`,
      status: status 
    });
  } catch (error) {
    console.error(`Eroare la actualizarea statusului:`, error);
    return res.status(500).json({ message: `Eroare la actualizarea statusului.`});
  }
};

export const getIstoricById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const appointmentId = id;
    
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Programare not found' });
    }
    
    const receive = await ReceiveCar.findOne({
      where: { appointmentId }
    });

    let processing = await ProcessingCar.findOne({
      where: { appointmentId },
      include: [{ 
        model: Part,
        through: { 
          attributes: ['quantity'] 
        }
      }]
    });
    
    //create istoric object with the found data
    const istoric = {
      id: parseInt(id),
      appointmentId: parseInt(appointmentId),
      receiveCar: receive,
      processingCar: processing,
      status: processing ? 'finalizat' : 'in lucru',
      createdAt: receive?.createdAt || processing?.createdAt || new Date(),
      updatedAt: receive?.updatedAt || processing?.updatedAt || new Date()
    };
    
    return res.status(200).json(istoric);
  } catch (error) {
    console.error(`Eroare la obținerea istoricului:`, error);
    return res.status(500).json({ message: `Eroare la obținerea istoricului.`});
  }
};

export const getProcessingParts = async (req: Request, res: Response): Promise<Response> => {
  
  try {
    const { id } = req.params;
    const usedParts = await UsedPart.findAll({
      where: { processingId: id }
    });
    
    if (usedParts.length === 0) {
      return res.json([]);
    }
    const rezultate = [];
    
    for (const usedPart of usedParts) {
      const part = await Part.findByPk(usedPart.partId);
      if (part) {
        rezultate.push({
          id: part.id,
          name: part.name,
          code: part.code,
          price: part.price,
          UsedPart: {
            cantitate: usedPart.quantity
          }
        });
      }
    }
    return res.json(rezultate);
  } catch (error) {
    console.error(`Eroare la obținerea pieselor:`, error);
    return res.status(500).json({ message: `Eroare la obținerea pieselor.`});
  }
};