import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Client from './Client';

class Car extends Model {
  public id!: number;
  public clientId!: number;
  public registrationNumber!: string;
  public chassisSeries!: string;
  public brand!: string;
  public model!: string;
  public yearOfManufacture!: number;
  public engineType!: string;
  public engineCapacity!: number;
  public horsePower!: number;
  public kW!: number;
  public activa!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Car.init(
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
    registrationNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    chassisSeries: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    yearOfManufacture: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    engineType: {
      type: DataTypes.ENUM('diesel', 'benzina', 'hibrid', 'electric'),
      allowNull: false,
    },
    engineCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    horsePower: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kW: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'cars',
  }
);

//relation: one client has many cars(One-To-Many)
Client.hasMany(Car, { foreignKey: 'clientId' });
Car.belongsTo(Client, { foreignKey: 'clientId' });

export default Car;