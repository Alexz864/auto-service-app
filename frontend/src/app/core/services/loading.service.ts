import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMessage = new BehaviorSubject<string>('Se încarcă...');

  constructor() {}

  setLoading(isLoading: boolean, message: string = 'Se încarcă...'): void {
    this.loadingSubject.next(isLoading);
    this.loadingMessage.next(message);
  }

  getLoadingState(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  getLoadingMessage(): Observable<string> {
    return this.loadingMessage.asObservable();
  }
}
