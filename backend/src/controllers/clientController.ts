import { Request, Response } from 'express';
import { Client, Car } from '../models';

export const createClient = async(req: Request, res: Response) : Promise<Response> => {

  const { last_name, first_name, email, phone, activ } = req.body;
  
  try {
    const newClient = await Client.create({
      last_name,
      first_name,
      email,
      phone,
      activ: activ === false ? false : true,
    });
    
    return res.status(201).json(newClient);
  } catch (error) {
    console.error('Eroare la crearea clientului:', error);
    return res.status(500).json({ message: 'Eroare la crearea clientului.' });
  }
};

export const getAllClients = async(req: Request, res: Response): Promise<Response> => {

  try {
    const showInactive = req.query.showInactive === 'true';
    let whereCondition = {};

    if (!showInactive) {
      whereCondition = { activ: true };
    }
    
    const clients = await Client.findAll({
      where: whereCondition,
      include: [{ model: Car }],
    });
    
    return res.json(clients);
  } catch (error) {
    console.error('Eroare la obținerea clienților:', error);
    return res.status(500).json({ message: 'Eroare la obținerea clienților.' });
  }
}

export const getClientById = async(req: Request, res: Response) : Promise<Response> => {

  const { id } = req.params;

  try {
    const client = await Client.findByPk(id, {
      include: [{ model: Car }],
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Clientul nu a fost găsit.' });
    }
    
    return res.json(client);
  } catch (error) {
    console.error(`Eroare la obținerea clientului cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea clientului cu id ${id}.` });
  }
};



export const updateClient = async(req: Request, res: Response) : Promise<Response> => {

  const { id } = req.params;
  const { last_name, first_name, email, phone } = req.body;
  
  try {
    const client = await Client.findByPk(id);
    
    if (!client) {
      return res.status(404).json({ message: 'Clientul nu a fost găsit.' });
    }
    
    await client.update({
      last_name: last_name || client.last_name,
      first_name: first_name || client.first_name,
      email: email || client.email,
      phone: phone || client.phone,
    });
    
    return res.json(client);
  } catch (error) {
    console.error(`Eroare la actualizarea clientului cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la actualizarea clientului cu id ${id}.` });
  }
};

export const deactivateClient = async(req: Request, res: Response) : Promise<Response> => {

  const { id } = req.params;
  
  try {
    const client = await Client.findByPk(id);
    
    if (!client) {
      return res.status(404).json({ message: 'Clientul nu a fost găsit.' });
    }
    
    await client.update({ activ: false });
    
    return res.json({ message: 'Clientul a fost dezactivat cu succes' });
  } catch (error) {
    console.error(`Eroare la dezactivarea clientului cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la dezactivarea clientului cu id ${id}.` });
  }
};

export const reactivateClient = async(req: Request, res: Response) : Promise<Response> => {

  const { id } = req.params;
  
  try {
    const client = await Client.findByPk(id);
    
    if (!client) {
      return res.status(404).json({ message: 'Clientul nu a fost găsit.' });
    }
    
    await client.update({ activ: true });
    
    return res.json({ message: 'Clientul a fost reactivat cu succes' });
  } catch (error) {
    console.error(`Eroare la reactivarea clientului cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la reactivarea clientului cu id ${id}.` });
  }
};

export const deleteClient = async(req: Request, res: Response) : Promise<Response> => {
  
  const { id } = req.params;
  
  try {
    const client = await Client.findByPk(id);
    
    if (!client) {
      return res.status(404).json({ message: 'Clientul nu a fost găsit.' });
    }
    
    await client.destroy();
    
    return res.json({ message: 'Clientul a fost șters cu succes.' });
  } catch (error) {
    console.error(`Eroare la ștergerea clientului cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la ștergerea clientului cu id ${id}.` });
  }
};