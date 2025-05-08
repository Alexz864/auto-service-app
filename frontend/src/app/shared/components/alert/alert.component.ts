import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Notification, NotificationType } from '../../../core/services/notification.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications()
      .subscribe(notification => {
        this.notifications.push(notification);
        setTimeout(() => this.removeNotification(notification), 5000);
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeNotification(notification: Notification): void {
    this.notifications = this.notifications.filter(n => n !== notification);
  }

  getAlertClass(notification: Notification): string {
    switch (notification.type) {
      case NotificationType.SUCCESS:
        return 'alert-success';
      case NotificationType.ERROR:
        return 'alert-danger';
      case NotificationType.INFO:
        return 'alert-info';
      case NotificationType.WARNING:
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  }
}
