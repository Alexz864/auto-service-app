export enum ContactMethod {
  EMAIL = 'email',
  PHONE = 'telefon',
  PERSON = 'personal'
}

export interface Appointment {
  id?: number;
  clientId: number;
  carId: number;
  date: Date;
  time: number;
  problemDescription: string;
  contactMethod: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}
