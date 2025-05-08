import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Car } from '../../../../core/models/car.model';
import { Client } from '../../../../core/models/client.model';
import { Appointment } from '../../../../core/models/appointment.model';
import { CarService } from '../../../../core/services/car.service';
import { ClientService } from '../../../../core/services/client.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-car-details',
  templateUrl: './car-details.component.html',
  styleUrls: ['./car-details.component.scss']
})
export class CarDetailsComponent implements OnInit {
  car: Car | null = null;
  client: Client | null = null;
  recentAppointments: Appointment[] = [];
  loading: boolean = false;
  carId: number | null = null;

  constructor(
    private carService: CarService,
    private clientService: ClientService,
    private appointmentService: AppointmentService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carId = +id;
      this.loadCarDetails();
    } else {
      this.router.navigate(['/cars']);
    }
  }

  loadCarDetails(): void {
    if (this.carId) {
      this.loading = true;
      this.loadingService.setLoading(true, 'Se încarcă detaliile mașinii...');

      this.carService.getById(this.carId).subscribe({
        next: (car) => {
          this.car = car;

          const client$ = this.clientService.getById(car.clientId);
          const appointments$ = this.carId !== null
            ? this.appointmentService.getByMasinaId(this.carId)
            : of([]);

          forkJoin([client$, appointments$]).subscribe({
            next: ([client, appointments]) => {
              this.client = client;
              this.recentAppointments = appointments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);

              this.loading = false;
              this.loadingService.setLoading(false);
            },
            error: (error) => {
              this.notificationService.showError('Eroare la încărcarea datelor asociate: ' + error.message);
              this.loading = false;
              this.loadingService.setLoading(false);
            }
          });
        },
        error: (error) => {
          this.notificationService.showError('Eroare la încărcarea detaliilor mașinii: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/cars']);
        }
      });
    }
  }

  onActivateCar(): void {
    if (this.carId) {
      this.loadingService.setLoading(true, 'Se activează mașina...');

      this.carService.activate(this.carId).subscribe({
        next: () => {
          if (this.car) {
            this.car.activa = true;
          }
          this.notificationService.showSuccess('Mașina a fost activată cu succes!');
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la activarea mașinii: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }

  onDeactivateCar(): void {
    if (this.carId) {
      this.loadingService.setLoading(true, 'Se dezactivează mașina...');

      this.carService.deactivate(this.carId).subscribe({
        next: () => {
          if (this.car) {
            this.car.activa = false;
          }
          this.notificationService.showSuccess('Mașina a fost dezactivată cu succes!');
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la dezactivarea mașinii: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }

  onDeleteCar(): void {
    if (this.carId && confirm('Sunteți sigur că doriți să ștergeți această mașină? Această acțiune nu poate fi anulată.')) {
      this.loadingService.setLoading(true, 'Se șterge mașina...');

      this.carService.delete(this.carId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Mașina a fost ștearsă cu succes!');
          this.loadingService.setLoading(false);
          this.router.navigate(['/cars']);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la ștergerea mașinii: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }

  calculateFinishDate(date: Date, time: number): Date {
    const finishDate = new Date(new Date(date).getTime() + time * 60000);
    return finishDate;
  }
}
