import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import sequelize from './config/database';
import { seedDatabase } from './seeds/dbSeeder';

//load environment variables
dotenv.config();

//initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//logger for requests(development-only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

app.use('/api', routes);

//health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Service Auto API is running!' });
});

//route not-found handler
app.use(/(.*)/, (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

//global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

//database connection and server start
const startServer = async () => {
  try {

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database connected!');
    
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();