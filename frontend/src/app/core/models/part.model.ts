export interface Part {
  id?: number;
  name: string;
  code: string;
  description: string;
  price: number;
  stock: number;
  activa: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
