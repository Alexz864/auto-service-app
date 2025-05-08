export enum EngineType {
  DIESEL = 'diesel',
  GASOLINE = 'benzina',
  HIBRID = 'hibrid',
  ELECTRIC = 'electric'
}

export interface Car {
  id?: number;
  clientId: number;
  registrationNumber: string;
  chassisSeries: string;
  brand: string;
  model: string;
  yearOfManufacture: number;
  engineType: EngineType;
  engineCapacity: number;
  horsePower: number;
  kW: number;
  activa: boolean;
  created_at?: Date;
  updated_at?: Date;
}
