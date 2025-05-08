import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Appointment from './Appointment';

class ProcessingCar extends Model {
  public id!: number;
  public appointmentId!: number;
  public operationsDone!: string;
  public foundProblems!: string;
  public solvedProblems!: string;
  public serviceTime!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProcessingCar.init(
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
    operationsDone: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    foundProblems: {
      type: DataTypes.TEXT,
    },
    solvedProblems: {
      type: DataTypes.TEXT,
    },
    serviceTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isMultipleOf10: (value: number) => {
          if (value % 10 !== 0) {
            throw new Error('Durata trebuie să fie multiplă de 10 minute.');
          }
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'processing_cars',
  }
);

//realtion: one appointment has one processing_car(One-To-One)
Appointment.hasOne(ProcessingCar, { foreignKey: 'appointmentId' });
ProcessingCar.belongsTo(Appointment, { foreignKey: 'appointmentId' });

export default ProcessingCar;