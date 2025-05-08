import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Client from './Client';
import Car from './Car';

class Appointment extends Model {
  public id!: number;
  public clientId!: number;
  public carId!: number;
  public date!: Date;
  public time!: number;
  public problemDescription!: string;
  public contactMethod!: string;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: 'id',
      },
    },
    carId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Car,
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        isMultipleOf30: (value: number) => {
          if (value % 30 !== 0) {
            throw new Error('Durata trebuie să fie multiplă de 30 minute.');
          }
        },
      },
    },
    problemDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contactMethod: {
      type: DataTypes.ENUM('email', 'telefon', 'personal'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('programat', 'in lucru', 'finalizat', 'anulat'),
      allowNull: false,
      defaultValue: 'programat',
    },
  },
  {
    sequelize,
    tableName: 'appointments',
  }
);

//relation: one client has many cars(One-To-Many)
Client.hasMany(Appointment, { foreignKey: 'clientId' });
Appointment.belongsTo(Client, { foreignKey: 'clientId' });

//relation: one car has many appointments(One-To-Many)
Car.hasMany(Appointment, { foreignKey: 'carId' });
Appointment.belongsTo(Car, { foreignKey: 'carId' });

export default Appointment;