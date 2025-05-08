import { Client, Car, Part } from '../models';
import { seedData } from './seedData';
import sequelize from '../config/database';

export const seedDatabase = async (): Promise<void> => {
  try {

    const clientCount = await Client.count();
    
    if (clientCount > 0) {
      console.log('Baza de date conține deja date. Nu este necesar un seeding.');
      return;
    }
    
    console.log('Începe popularea bazei de date cu date inițiale...');
    
    const transaction = await sequelize.transaction();
    
    try {
      const clients = await Client.bulkCreate(seedData.clients, { transaction });
      console.log(`${clients.length} clienți adăugați.`);
      
      const carsToAdd = seedData.cars.map((car, index) => {
        return {
          ...car,
          clientId: clients[index % clients.length].id
        };
      });
      
      await Car.bulkCreate(carsToAdd, { transaction });
      console.log(`${carsToAdd.length} mașini adăugate.`);
      
      await Part.bulkCreate(seedData.parts, { transaction });
      console.log(`${seedData.parts.length} piese adăugate.`);
      
      await transaction.commit();
      console.log('Seeding finalizat cu succes!');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Eroare la popularea bazei de date:', error);
  }
};