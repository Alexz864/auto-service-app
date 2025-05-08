import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { IstoricService, IstoricReceiveCar, IstoricProcessingCar } from '../models/istoric-service.model';

@Injectable({
  providedIn: 'root'
})
export class IstoricServiceService {
  private endpoint = 'istoric-service';

  constructor(private apiService: ApiService) {}

  getAll(params?: any): Observable<IstoricService[]> {
    return this.apiService.get<IstoricService[]>(this.endpoint, params);
  }

  getById(id: number): Observable<IstoricService> {
    return this.apiService.getById<IstoricService>(this.endpoint, id);
  }

  getByAppointmentId(appointmentId: number): Observable<IstoricService> {
    return this.apiService.get<IstoricService>(`appointments/${appointmentId}/istoric`);
  }

  create(appointmentId: number): Observable<IstoricService> {
    return this.apiService.post<IstoricService>(this.endpoint, { appointmentId });
  }

  addReceiveCar(istoricId: number, receive: IstoricReceiveCar): Observable<IstoricReceiveCar> {
    return this.apiService.post<IstoricReceiveCar>(`${this.endpoint}/${istoricId}/receive`, receive);
  }

  updateReceiveCar(istoricId: number, receiveId: number, receive: IstoricReceiveCar): Observable<IstoricReceiveCar> {
    return this.apiService.put<IstoricReceiveCar>(`${this.endpoint}/${istoricId}/receive/${receiveId}`, receive);
  }

  addProcessingCar(istoricId: number, processing: IstoricProcessingCar): Observable<IstoricProcessingCar> {
    const serverProcessing = {
      ...processing,
      serviceTime: processing.serviceTime,

      usedParts: processing.usedParts?.map(part => ({
        partId: part.partId,
        quantity: part.quantity
      }))
    };

    return this.apiService.post<IstoricProcessingCar>(`${this.endpoint}/${istoricId}/processing`, serverProcessing);
  }

  updateProcessingCar(istoricId: number, processingId: number, processing: IstoricProcessingCar): Observable<IstoricProcessingCar> {
    const serverProcessing = {
      ...processing,
      serviceTime: processing.serviceTime,
      usedParts: processing.usedParts?.map(part => ({
        partId: part.partId,
        quantity: part.quantity
      }))
    };

    return this.apiService.put<IstoricProcessingCar>(`${this.endpoint}/${istoricId}/processing/${processingId}`, serverProcessing);
  }

  updateStatus(istoricId: number, status: string): Observable<any> {
    return this.apiService.patchAction(`${this.endpoint}/${istoricId}/status`, { status });
  }
}
