import { Request, Response } from 'express';
import { Car, Client } from '../models';

export const createCar = async (req: Request, res: Response) : Promise<Response> => {

  const { 
    clientId, 
    registrationNumber, 
    chassisSeries, 
    brand, 
    model, 
    yearOfManufacture, 
    engineType, 
    engineCapacity, 
    horsePower,
    activa,
  } = req.body;

  if (!clientId || !registrationNumber || !chassisSeries || !brand || !model || !yearOfManufacture || !engineType || !engineCapacity || !horsePower) {
    return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii.' });
  }
  
  try {
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Clientul nu a fost găsit.' });
    }
    
    //calculate kW from HP
    const kW = parseFloat((horsePower * 0.745699872).toFixed(1));
    
    const newCar = await Car.create({
      clientId,
      registrationNumber,
      chassisSeries,
      brand,
      model,
      yearOfManufacture,
      engineType,
      engineCapacity,
      horsePower,
      kW,
      activa: activa === undefined ? true : activa  //use the value from the request or true if it doesn't exist
    });
    
    return res.status(201).json(newCar);
  } catch (error) {
    console.error('Eroare la crearea mașinii:', error);
    return res.status(500).json({ message: 'Eroare la crearea mașinii.' });
  }
};

export const getAllCars = async (req: Request, res: Response) : Promise<Response> => {

  try {
    const showInactive = req.query.showInactive === 'true';
    
    const whereClause = showInactive ? {} : { activa: true };
    
    const cars = await Car.findAll({
      where: whereClause,
      include: [{ model: Client }],
    });
    return res.json(cars);
  } catch (error) {
    console.error('Eroare la obținerea mașinilor:', error);
    return res.status(500).json({ message: 'Eroare la obținerea mașinilor.' });
  }
};

export const getCarById = async (req: Request, res: Response) : Promise<Response> => {

  const { id } = req.params;

  try {
    const car = await Car.findByPk(id, {
      include: [{ model: Client }],
    });
    
    if (!car) {
      return res.status(404).json({ message: 'Mașina nu a fost găsită.' });
    }
    
    return res.json(car);
  } catch (error) {
    console.error(`Eroare la obținerea mașinii cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea mașinii cu id ${id}.` });
  }
};

export const getCarsByClientId = async (req: Request, res: Response) : Promise<Response> => {

  const clientId = req.params.id;

  try {
    const cars = await Car.findAll({
      where: { 
        clientId,
        activa: true 
      }
    });
    
    return res.json(cars);
  } catch (error) {
    console.error(`Eroare la obținerea mașinilor pentru clientul cu id ${clientId}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea mașinilor pentru clientul cu id ${clientId}.` });
  }
};

export const updateCar = async (req: Request, res: Response) : Promise<Response> => {

  const { id } = req.params;
  const { 
    registrationNumber, 
    chassisSeries, 
    brand, 
    model, 
    yearOfManufacture, 
    engineType, 
    engineCapacity, 
    horsePower 
  } = req.body;
  
  try {
    const car = await Car.findByPk(id);
    
    if (!car) {
      return res.status(404).json({ message: 'Mașina nu a fost găsită.' });
    }
    
    //calculate kW only if HP has changed
    const kW = horsePower ? parseFloat((horsePower * 0.745699872).toFixed(1)) : car.kW;
    
    await car.update({
      registrationNumber: registrationNumber || car.registrationNumber,
      chassisSeries: chassisSeries || car.chassisSeries,
      brand: brand || car.brand,
      model: model || car.model,
      yearOfManufacture: yearOfManufacture || car.yearOfManufacture,
      engineType: engineType || car.engineType,
      engineCapacity: engineCapacity || car.engineCapacity,
      caiPutere: horsePower || car.horsePower,
      kW
    });
    
    return res.json(car);
  } catch (error) {
    console.error(`Eroare la actualizarea mașinii cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la actualizarea mașinii cu id ${id}.` });
  }
};

export const deactivateCar = async (req: Request, res: Response) : Promise<Response> => {

  const { id } = req.params;
  
  try {
    const car = await Car.findByPk(id);
    
    if (!car) {
      return res.status(404).json({ message: 'Mașina nu a fost găsită.' });
    }
    
    await car.update({ activa: false });
    
    return res.json({ message: 'Mașina a fost dezactivată cu succes' });
  } catch (error) {
    console.error(`Eroare la dezactivarea mașinii cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la dezactivarea mașinii cu id ${id}.` });
  }
};

export const reactivatecar = async (req: Request, res: Response) : Promise<Response> => {

  const { id } = req.params;
  
  try {
    const car = await Car.findByPk(id);
    
    if (!car) {
      return res.status(404).json({ message: 'Mașina nu a fost găsită.' });
    }
    
    await car.update({ activa: true });
    
    return res.json({ message: 'Mașina a fost reactivată cu succes.' });
  } catch (error) {
    console.error(`Eroare la reactivarea mașinii cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la reactivarea mașinii cu id ${id}.` });
  }
};

export const deleteCar = async (req: Request, res: Response): Promise<Response> => {
  
  const { id } = req.params;
  
  try {
    const car = await Car.findByPk(id);
    
    if (!car) {
      return res.status(404).json({ message: 'Mașina nu a fost găsită' });
    }

    await car.destroy();

    return res.json({ message: 'Mașina a fost ștearsă cu succes.' });
  } catch (error) {
    console.error(`Eroare la ștergerea mașinii cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la ștergerea mașinii cu id ${id}.` });
  }
};