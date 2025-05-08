import { Request, Response } from 'express';
import { ProcessingCar, Appointment, Part, UsedPart } from '../models';
import sequelize from '../config/database';

export const createProcessing = async (req: Request, res: Response): Promise<Response> => {

  const { 
    appointmentId, 
    operationsDone, 
    foundProblems, 
    solvedProblems, 
    serviceTime,
    usedParts
  } = req.body;
  
  if (!appointmentId || !operationsDone || !serviceTime) {
    return res.status(400).json({ 
      message: 'ID-ul programării, operațiunile efectuate și durata reparației sunt obligatorii.' 
    });
  }
  
  if (serviceTime % 10 !== 0) {
    return res.status(400).json({ message: 'Durata reparației trebuie să fie multiplă de 10 minute.' });
  }
  
  const transaction = await sequelize.transaction();
  
  try {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Programarea nu a fost găsită.' });
    }
    
    const existingProcessing = await ProcessingCar.findOne({ where: { appointmentId } });
    if (existingProcessing) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Există deja o procesare pentru această programare.' });
    }
    
    await appointment.update({ status: 'finalizat' }, { transaction });
    
    const newProcessing = await ProcessingCar.create({
      appointmentId,
      operationsDone,
      foundProblems: foundProblems || '',
      solvedProblems: solvedProblems || '',
      serviceTime
    }, { transaction });
    
    //process used parts if they exist
    if (usedParts && Array.isArray(usedParts) && usedParts.length > 0) {
      for (const partInfo of usedParts) {
        const { partId, quantity } = partInfo;
        
        const part = await Part.findByPk(partId);
        if (!part) {
          await transaction.rollback();
          return res.status(404).json({ message: `Piesa cu id ${partId} nu a fost găsită.` });
        }
        
        if (part.stock < quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: `Stoc insuficient pentru piesa ${part.name}. Stoc disponibil: ${part.stock}.` 
          });
        }
        
        await part.update({ 
          stoc: part.stock - quantity 
        }, { transaction });
        
        await UsedPart.create({
          processingId: newProcessing.id,
          partId,
          quantity
        }, { transaction });
      }
    }
    
    await transaction.commit();
    
    const result = await ProcessingCar.findByPk(newProcessing.id, {
      include: [
        { model: Appointment },
        { model: Part }
      ]
    });
    
    return res.status(201).json(result);
  } catch (error) {
    await transaction.rollback();
    console.error('Eroare la crearea procesării:', error);
    return res.status(500).json({ message: 'Eroare la crearea procesării.' });
  }
};

export const getAllProcessings = async (req: Request, res: Response): Promise<Response> => {

  try {
    const processings = await ProcessingCar.findAll({
      include: [
        { model: Appointment },
        { model: Part }
      ]
    });

    return res.json(processings);
  } catch (error) {
    console.error('Eroare la obținerea procesărilor:', error);
    return res.status(500).json({ message: 'Eroare la obținerea procesărilor.' });
  }
};

export const getProcessingById = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;

  try {
    const processing = await ProcessingCar.findByPk(id, {
      include: [
        { model: Appointment },
        { model: Part }
      ]
    });
    
    if (!processing) {
      return res.status(404).json({ message: 'Procesarea nu a fost găsită.' });
    }
    
    return res.json(processing);
  } catch (error) {
    console.error(`Eroare la obținerea procesării cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea procesării cu id ${id}.` });
  }
};

export const getProcessingByAppointmentId = async (req: Request, res: Response): Promise<Response> => {

  const { appointmentId } = req.params;

  try {
    const processing = await ProcessingCar.findOne({
      where: { appointmentId },
      include: [
        { model: Appointment },
        { model: Part }
      ]
    });
    
    if (!processing) {
      return res.status(404).json({ message: 'Procesarea nu a fost găsită pentru această programare.' });
    }
    
    return res.json(processing);
  } catch (error) {
    console.error(`Eroare la obținerea procesării pentru programarea cu id ${appointmentId}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea procesării pentru programarea cu id ${appointmentId}.` });
  }
};

export const updateProcessing = async (req: Request, res: Response): Promise<Response> => {

  const { processingId } = req.params;
  const { operationsDone, foundProblems, solvedProblems, serviceTime, usedParts } = req.body;
  
  const transaction = await sequelize.transaction();
  
  try {
    const processing = await ProcessingCar.findByPk(processingId);
    
    if (!processing) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Procesarea nu a fost găsită.' });
    }
    
    if (serviceTime && serviceTime % 10 !== 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Durata reparației trebuie să fie multiplă de 10 minute.' });
    }

    await processing.update({
      operationsDone: operationsDone !== undefined ? operationsDone : processing.operationsDone,
      foundProblems: foundProblems !== undefined ? foundProblems : processing.foundProblems,
      solvedProblems: solvedProblems !== undefined ? solvedProblems : processing.solvedProblems,
      serviceTime: serviceTime !== undefined ? serviceTime : processing.serviceTime
    }, { transaction });
    
    //if we have updated parts, we update the relations too
    if (usedParts && Array.isArray(usedParts)) {
      const existingUsedParts = await UsedPart.findAll({
        where: { processingId }
      });
      
      //verify the stock for the existent parts
      for (const usedPart of existingUsedParts) {
        const part = await Part.findByPk(usedPart.partId);
        if (part) {
          await part.update({
            stoc: part.stock + usedPart.quantity
          }, { transaction });
        }
      }
      
      //delete the current records
      await UsedPart.destroy({
        where: { processingId },
        transaction
      });
      
      //add the new parts and update the stock
      for (const partInfo of usedParts) {
        const { partId, quantity } = partInfo;
        
        if (!partId || !quantity || quantity <= 0) {
          continue; //ignore invalid parts
        }
        
        const part = await Part.findByPk(partId);
        if (!part) {
          continue; //ignore non-existent parts
        }
        
        if (part.stock < quantity) {
          continue; //ignore parts that have no stock
        }
        
        await part.update({ 
          stock: part.stock - quantity 
        }, { transaction });
        
        await UsedPart.create({
          processingId,
          partId,
          quantity
        }, { transaction });
      }
    }
    
    await transaction.commit();

    const result = await ProcessingCar.findByPk(processingId, {
      include: [
        { model: Appointment },
        { 
          model: Part,
          through: { attributes: ['quantity'] }
        }
      ]
    });
    
    return res.json(result);
  } catch (error) {
    await transaction.rollback();
    console.error(`Eroare la actualizarea procesării cu id ${processingId}:`, error);
    return res.status(500).json({ message: `Eroare la actualizarea procesării cu id ${processingId}.` });
  }
};

export const addPartToProcessing = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;
  const { partId, quantity } = req.body;
  
  if (!partId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'ID-ul piesei și cantitatea (> 0) sunt obligatorii.' });
  }
  
  const transaction = await sequelize.transaction();
  
  try {
    const processing = await ProcessingCar.findByPk(id);
    if (!processing) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Procesarea nu a fost găsită.' });
    }
    
    const part = await Part.findByPk(partId);
    if (!part) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Piesa nu a fost găsită.' });
    }
    
    if (part.stock < quantity) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Stoc insuficient pentru piesa ${part.name}. Stoc disponibil: ${part.stock}.` 
      });
    }
    
    const existingUsedPart = await UsedPart.findOne({
      where: {
        processingId: id,
        partId
      }
    });
    
    if (existingUsedPart) {
      const newQuantity = existingUsedPart.quantity + quantity;
      
      await existingUsedPart.update({ quantity: newQuantity }, { transaction });

      await part.update({ stock: part.stock - quantity }, { transaction });
      
      await transaction.commit();
      
      return res.json({
        message: `Cantitatea piesei a fost actualizată la ${newQuantity}.`,
        usedPart: existingUsedPart
      });
    }
    
    const usedPart = await UsedPart.create({
      processingId: id,
      partId,
      quantity
    }, { transaction });
    
    await part.update({ stoc: part.stock - quantity }, { transaction });
    
    await transaction.commit();
    
    return res.status(201).json({
      message: 'Piesa a fost adăugată cu succes la procesare.',
      usedPart
    });
  } catch (error) {
    await transaction.rollback();
    console.error(`Eroare la adăugarea piesei la procesarea cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la adăugarea piesei la procesarea cu id ${id}.` });
  }
};

export const removePartFromProcessing = async (req: Request, res: Response): Promise<Response> => {

  const { processingId, partId } = req.params;
  
  const transaction = await sequelize.transaction();
  
  try {
    const usedPart = await UsedPart.findOne({
      where: {
        processingId,
        partId
      }
    });
    
    if (!usedPart) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Piesa nu a fost găsită în această procesare.' });
    }
    
    const part = await Part.findByPk(partId);
    if (part) {
      await part.update({ 
        stoc: part.stock + usedPart.quantity 
      }, { transaction });
    }
    
    await usedPart.destroy({ transaction });
    
    await transaction.commit();
    
    return res.json({ message: 'Piesa a fost eliminată cu succes din procesare.' });
  } catch (error) {
    await transaction.rollback();
    console.error(`Eroare la eliminarea piesei din procesarea cu id ${processingId}:`, error);
    return res.status(500).json({ message: `Eroare la eliminarea piesei din procesarea cu id ${processingId}.` });
  }
};