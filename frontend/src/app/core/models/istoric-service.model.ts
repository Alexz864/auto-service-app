export interface IstoricReceiveCar {
  id?: number;
  appointmentId: number;
  visualProblems: string;
  clientReportedProblems: string;
  purpose: string;
  created_at?: Date;
}

export interface PartWithPartUsed {
  id: number;
  name: string;
  code: string;
  price: number;
  UsedPart: {
    quantity: number;
  };
}

export interface IstoricProcessingCar {
  id?: number;
  appointmentId?: number;
  operationsDone: string;
  foundProblems: string;
  solvedProblems: string;
  serviceTime?: number;
  usedParts?: UsedPart[];

  Parts?: Array<{
    id: number;
    name: string;
    code: string;
    price: number;
    UsedPart: {
      quantity: number;
    };
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IstoricService {
  id?: number;
  appointmentId: number;
  receiveCar ?: IstoricReceiveCar;
  processingCar?: IstoricProcessingCar;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UsedPart {
  partId: number;
  quantity: number;
  name?: string;
  code?: string;
  price?: number;
}
