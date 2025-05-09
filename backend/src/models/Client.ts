import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Client extends Model {
  public id!: number;
  public last_name!: string;
  public first_name!: string;
  public email!: string;
  public phone!: string;
  public activ!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    last_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '(Not provided)'  // Default value for existing records
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    activ: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'clients',
  }
);

export default Client;