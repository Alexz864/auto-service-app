import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../../../core/models/client.model';
import { Car } from '../../../../core/models/car.model';
import { Appointment } from '../../../../core/models/appointment.model';
import { ClientService } from '../../../../core/services/client.service';
import { CarService } from '../../../../core/services/car.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit {
  client: Client | null = null;
  cars: Car[] = [];
  recentAppointments: Appointment[] = [];
  loading: boolean = false;
  clientId: number | null = null;

  constructor(
    private clientService: ClientService,
    private carService: CarService,
    private appointmentService: AppointmentService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clientId = +id;
      this.loadClientDetails();
    } else {
      this.router.navigate(['/clients']);
    }
  }

  loadClientDetails(): void {
    if (this.clientId) {
      this.loading = true;
      this.loadingService.setLoading(true, 'Se încarcă detaliile clientului...');

      const client$ = this.clientService.getById(this.clientId);
      const cars$ = this.carService.getByClientId(this.clientId);
      const appointments$ = this.appointmentService.getByClientId(this.clientId);

      forkJoin([client$, cars$, appointments$]).subscribe({
        next: ([client, cars, appointments]) => {
          this.client = client;
          this.cars = cars;
          this.recentAppointments = appointments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

          this.loading = false;
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la încărcarea detaliilor clientului: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/clients']);
        }
      });
    }
  }

  onActivateClient(): void {
    if (this.clientId) {
      this.loadingService.setLoading(true, 'Se activează clientul...');

      this.clientService.activate(this.clientId).subscribe({
        next: () => {
          if (this.client) {
            this.client.activ = true;
          }
          this.notificationService.showSuccess('Clientul a fost activat cu succes!');
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la activarea clientului: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }

  onDeactivateClient(): void {
    if (this.clientId) {
      this.loadingService.setLoading(true, 'Se dezactivează clientul...');

      this.clientService.deactivate(this.clientId).subscribe({
        next: () => {
          if (this.client) {
            this.client.activ = false;
          }
          this.notificationService.showSuccess('Clientul a fost dezactivat cu succes!');
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la dezactivarea clientului: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }

  onDeleteClient(): void {
    if (this.clientId && confirm('Sunteți sigur că doriți să ștergeți acest client? Această acțiune nu poate fi anulată.')) {
      this.loadingService.setLoading(true, 'Se șterge clientul...');

      this.clientService.delete(this.clientId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Clientul a fost șters cu succes!');
          this.loadingService.setLoading(false);
          this.router.navigate(['/clients']);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la ștergerea clientului: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }

  calculateFinishDate(date: Date, time: number): Date {
    const calculateFinishDate = new Date(new Date(date).getTime() + time * 60000);
    return calculateFinishDate;
  }
}
