import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Appointment from './Appointment';

class ReceiveCar extends Model {
  public id!: number;
  public appointmentId!: number;
  public visualProblems!: string;
  public clientReportedProblems!: string;
  public purpose!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ReceiveCar.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Appointment,
        key: 'id',
      },
    },
    visualProblems: {
      type: DataTypes.TEXT,
    },
    clientReportedProblems: {
      type: DataTypes.TEXT,
    },
    purpose: {
      type: DataTypes.ENUM('verificare', 'revizie', 'reparatie'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'receive_cars',
  }
);

//relation: one appointment has one receive_car(One-To-One)
Appointment.hasOne(ReceiveCar, { foreignKey: 'appointmentId' });
ReceiveCar.belongsTo(Appointment, { foreignKey: 'appointmentId' });

export default ReceiveCar;