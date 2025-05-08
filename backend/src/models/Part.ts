import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Part extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public description!: string;
  public price!: number;
  public stock!: number;
  public activa!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Part.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'parts',
  }
);

export default Part;