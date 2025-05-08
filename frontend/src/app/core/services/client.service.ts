import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private endpoint = 'clients';

  constructor(private apiService: ApiService) {}

  getAll(params?: any): Observable<Client[]> {
    return this.apiService.get<Client[]>(this.endpoint, params);
  }

  getById(id: number): Observable<Client> {
    return this.apiService.getById<Client>(this.endpoint, id);
  }

  create(client: Client): Observable<Client> {
    return this.apiService.post<Client>(this.endpoint, client);
  }

  update(id: number, client: Client): Observable<Client> {
    return this.apiService.put<Client>(this.endpoint, id, client);
  }

  activate(id: number): Observable<Client> {
    return this.apiService.patchAction<Client>(`${this.endpoint}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<Client> {
    return this.apiService.patchAction<Client>(`${this.endpoint}/${id}/deactivate`, {});
  }

  delete(id: number): Observable<any> {
    return this.apiService.delete(this.endpoint, id);
  }
}
