import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Car } from '../models/car.model';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private endpoint = 'cars';

  constructor(private apiService: ApiService) {}

  getAll(params?: any): Observable<Car[]> {
    return this.apiService.get<Car[]>(this.endpoint, params);
  }

  getById(id: number): Observable<Car> {
    return this.apiService.getById<Car>(this.endpoint, id);
  }

  getByClientId(clientId: number): Observable<Car[]> {
    return this.apiService.get<Car[]>(`clients/${clientId}/cars`);
  }

  create(car: Car): Observable<Car> {
    return this.apiService.post<Car>(this.endpoint, car);
  }

  update(id: number, car: Car): Observable<Car> {
    return this.apiService.put<Car>(this.endpoint, id, car);
  }

  activate(id: number): Observable<Car> {
    return this.apiService.patchAction<Car>(`${this.endpoint}/${id}/reactivate`, {});
  }

  deactivate(id: number): Observable<Car> {
    return this.apiService.patchAction<Car>(`${this.endpoint}/${id}/deactivate`, {});
  }

  delete(id: number): Observable<any> {
    return this.apiService.delete(this.endpoint, id);
  }

  calculateKwFromHp(horsePower: number): number {
    return parseFloat((horsePower * 0.735499).toFixed(1));
  }

  calculateHpFromKw(kw: number): number {
    return Math.round(kw / 0.735499);
  }
}
