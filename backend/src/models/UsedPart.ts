import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import ProcessingCar from './ProcessingCar';
import Part from './Part';

class UsedPart extends Model {
  public id!: number;
  public processingId!: number;
  public partId!: number;
  public quantity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UsedPart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    processingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProcessingCar,
        key: 'id',
      },
    },
    partId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Part,
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'used_parts',
  }
);

//realtion: Many-To-Many
ProcessingCar.belongsToMany(Part, { through: UsedPart, foreignKey: 'processingId' });
Part.belongsToMany(ProcessingCar, { through: UsedPart, foreignKey: 'partId' });

export default UsedPart;