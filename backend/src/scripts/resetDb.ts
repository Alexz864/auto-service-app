import sequelize from '../config/database';
import { seedDatabase } from '../seeds/dbSeeder';

const resetDatabase = async () => {
  try {
    console.log('Începe resetarea bazei de date...');
    
    //force rebuild tables
    await sequelize.sync({ force: true });
    console.log('Toate tabelele au fost recreate.');
    
    //seed the database
    await seedDatabase();
    
    console.log('Baza de date a fost resetată și repopulată cu succes!');
    process.exit(0);
  } catch (error) {
    console.error('Eroare la resetarea bazei de date:', error);
    process.exit(1);
  }
};

resetDatabase();