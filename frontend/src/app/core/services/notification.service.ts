import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning'
}

export interface Notification {
  type: NotificationType;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();

  getNotifications(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }

  showSuccess(message: string): void {
    this.notificationSubject.next({
      type: NotificationType.SUCCESS,
      message
    });
  }

  showError(message: string): void {
    this.notificationSubject.next({
      type: NotificationType.ERROR,
      message
    });
  }

  showInfo(message: string): void {
    this.notificationSubject.next({
      type: NotificationType.INFO,
      message
    });
  }

  showWarning(message: string): void {
    this.notificationSubject.next({
      type: NotificationType.WARNING,
      message
    });
  }
}
