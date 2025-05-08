import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Part } from '../models/part.model';

@Injectable({
  providedIn: 'root'
})
export class PartService {
  private endpoint = 'parts';

  constructor(private apiService: ApiService) {}

  getAll(params?: any): Observable<Part[]> {
    return this.apiService.get<Part[]>(this.endpoint, params);
  }

  getById(id: number): Observable<Part> {
    return this.apiService.getById<Part>(this.endpoint, id);
  }

  create(part: Part): Observable<Part> {
    return this.apiService.post<Part>(this.endpoint, part);
  }

  update(id: number, part: Part): Observable<Part> {
    return this.apiService.put<Part>(this.endpoint, id, part);
  }

  updateStock(id: number, quantity: number): Observable<Part> {
    return this.apiService.patchAction<Part>(`${this.endpoint}/${id}/updateStock`, { quantity });
  }

  activate(id: number): Observable<Part> {
    return this.apiService.patchAction<Part>(`${this.endpoint}/${id}/reactivate`, {});
  }

  deactivate(id: number): Observable<Part> {
    return this.apiService.patchAction<Part>(`${this.endpoint}/${id}/deactivate`, {});
  }

  delete(id: number): Observable<any> {
    return this.apiService.delete(this.endpoint, id);
  }

  getProcessingParts(processingId: number): Observable<any[]> {
    return this.apiService.get<any[]>(`istoric-service/processings/${processingId}/part`);
  }
}
