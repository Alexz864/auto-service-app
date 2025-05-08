import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private endpoint = 'appointments';

  constructor(private apiService: ApiService) {}

  getAll(params?: any): Observable<Appointment[]> {
    return this.apiService.get<Appointment[]>(this.endpoint, params);
  }

  getById(id: number): Observable<Appointment> {
    return this.apiService.getById<Appointment>(this.endpoint, id);
  }

  getByClientId(clientId: number): Observable<Appointment[]> {
    return this.apiService.get<Appointment[]>(`clients/${clientId}/appointments`);
  }

  getByMasinaId(carId: number): Observable<Appointment[]> {
    return this.apiService.get<Appointment[]>(`cars/${carId}/appointments`);
  }

  create(appointment: Appointment): Observable<Appointment> {
    return this.apiService.post<Appointment>(this.endpoint, appointment);
  }

  update(id: number, appointment: Appointment): Observable<Appointment> {
    return this.apiService.put<Appointment>(this.endpoint, id, appointment);
  }

  updateStatus(id: number, status: string): Observable<Appointment> {
    return this.apiService.patchAction<Appointment>(`${this.endpoint}/${id}/status`, { status });
  }

  delete(id: number): Observable<any> {
    return this.apiService.delete<any>('appointments', id);
  }

  verifyDisponibility(date: string, time: number): Observable<boolean> {
    return this.apiService.get<boolean>(`${this.endpoint}/verify-disponibility`, { date, time });
  }
}
