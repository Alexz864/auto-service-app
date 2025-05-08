import { Request, Response } from 'express';
import { Part } from '../models';

export const createPart = async (req: Request, res: Response): Promise<Response> => {

  const { name, code, description, price, stock, activa } = req.body;
  
  if (!name || !code || !price) {
    return res.status(400).json({ message: 'Denumirea, codul și prețul sunt obligatorii.' });
  }
  
  try {
    const exisitingPart = await Part.findOne({ where: { code } });
    if (exisitingPart) {
      return res.status(400).json({ message: 'Există deja o piesă cu acest cod.' });
    }
    
    const newPart = await Part.create({
      name,
      code,
      description: description || '',
      price,
      stock: stock || 0,
      activa: activa !== undefined ? activa : true  //use the request value or true by default
    });
    
    return res.status(201).json(newPart);
  } catch (error) {
    console.error('Eroare la crearea piesei:', error);
    return res.status(500).json({ message: 'Eroare la crearea piesei.' });
  }
};

export const getAllParts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const showInactive = req.query.showInactive === 'true';
    
    const whereClause = showInactive ? {} : { activa: true };
    
    const parts = await Part.findAll({
      where: whereClause
    });

    return res.json(parts);
  } catch (error) {
    console.error('Eroare la obținerea pieselor:', error);
    return res.status(500).json({ message: 'Eroare la obținerea pieselor.' });
  }
};

export const getPartById = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;

  try {
    const part = await Part.findByPk(id);
    
    if (!part) {
      return res.status(404).json({ message: 'Piesa nu a fost găsită.' });
    }
    
    return res.json(part);
  } catch (error) {
    console.error(`Eroare la obținerea piesei cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea piesei cu id ${id}.` });
  }
};

export const updatePart = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;
  const { name, code, description, price } = req.body;
  
  try {
    const part = await Part.findByPk(id);
    
    if (!part) {
      return res.status(404).json({ message: 'Piesa nu a fost găsită.' });
    }
    
    if (code && code !== part.code) {
      const exisitingPart = await Part.findOne({ where: { code } });
      if (exisitingPart) {
        return res.status(400).json({ message: 'Există deja o piesă cu acest cod.' });
      }
    }
    
    await part.update({
      name: name || part.name,
      code: code || part.code,
      description: description !== undefined ? description : part.description,
      price: price || part.price
    });
    
    return res.json(part);
  } catch (error) {
    console.error(`Eroare la actualizarea piesei cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la actualizarea piesei cu id ${id}.` });
  }
};

export const updateStock = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;
  const { quantity } = req.body;
  
  if (quantity === undefined) {
    return res.status(400).json({ message: 'Cantitatea este obligatorie.' });
  }
  
  try {
    const part = await Part.findByPk(id);
    
    if (!part) {
      return res.status(404).json({ message: 'Piesa nu a fost găsită.' });
    }
    
    const newStock = quantity;
    
    if (newStock < 0) {
      return res.status(400).json({ message: 'Stocul nu poate fi negativ.' });
    }
    
    await part.update({ stock: newStock });
    
    return res.json({
      message: `Stocul a fost actualizat cu succes. Noul stoc: ${newStock}.`,
      stock: newStock
    });
  } catch (error) {
    console.error(`Eroare la actualizarea stocului pentru piesa cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la actualizarea stocului pentru piesa cu id ${id}.` });
  }
};

export const deactivatePart = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;
  
  try {
    const part = await Part.findByPk(id);
    
    if (!part) {
      return res.status(404).json({ message: 'Piesa nu a fost găsită.' });
    }
    
    await part.update({ activa: false });
    
    return res.json({ message: 'Piesa a fost dezactivată cu succes.' });
  } catch (error) {
    console.error(`Eroare la dezactivarea piesei cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la dezactivarea piesei cu id ${id}.` });
  }
};

export const reactivatePart = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;
  
  try {
    const part = await Part.findByPk(id);
    
    if (!part) {
      return res.status(404).json({ message: 'Piesa nu a fost găsită.' });
    }
    
    await part.update({ activa: true });
    
    return res.json({ message: 'Piesa a fost reactivată cu succes.' });
  } catch (error) {
    console.error(`Eroare la reactivarea piesei cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la reactivarea piesei cu id ${id}.` });
  }
};

export const deletePart = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;
  
  try {
    const part = await Part.findByPk(id);
    
    if (!part) {
      return res.status(404).json({ message: 'Piesa nu a fost găsită.' });
    }
    
    await part.destroy();
    
    return res.json({ message: 'Piesa a fost ștearsă cu succes.' });
  } catch (error) {
    console.error(`Eroare la ștergerea piesei cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la ștergerea piesei cu id ${id}.` });
  }
};