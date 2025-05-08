export interface Client {
  id?: number;
  last_name: string;
  first_name: string;
  phone: string;
  email: string;
  activ: boolean;
  created_at?: Date;
  updated_at?: Date;
}
