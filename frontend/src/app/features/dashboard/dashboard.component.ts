import { Component, OnInit } from '@angular/core';
import { ClientService } from 'src/app/core/services/client.service';
import { CarService } from 'src/app/core/services/car.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { IstoricServiceService } from 'src/app/core/services/istoric-service.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalClients: number = 0;
  totalCars: number = 0;
  appointmentsToday: number = 0;
  appointmentsThisWeek: number = 0;
  appointmentsThisMonth: number = 0;
  carsInService: number = 0;
  istoricCompletate: number = 0;
  loading: boolean = true;

  constructor(
    private clientService: ClientService,
    private carService: CarService,
    private appointmentService: AppointmentService,
    private istoricService: IstoricServiceService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadingService.setLoading(true, 'Se încarcă datele pentru dashboard...');

    const clienti$ = this.clientService.getAll();
    const cars$ = this.carService.getAll();
    const appointments$ = this.appointmentService.getAll();
    const istoric$ = this.istoricService.getAll();

    forkJoin([clienti$, cars$, appointments$, istoric$]).subscribe({
      next: ([clienti, cars, appointments, istoric]) => {

        this.totalClients = clienti.length;
        this.totalCars = cars.length;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const monthstart = new Date(now.getFullYear(), now.getMonth(), 1);

        this.appointmentsToday = appointments.filter(p => {
          const pData = new Date(p.date);
          return pData >= today && pData < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        }).length;
        this.appointmentsThisWeek = appointments.filter(p => new Date(p.date) >= weekStart).length;
        this.appointmentsThisMonth = appointments.filter(p => new Date(p.date) >= monthstart).length;

        this.carsInService = istoric.filter(i => i.status === 'in-progres').length;
        this.istoricCompletate = istoric.filter(i => i.status === 'finalizat').length;

        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Eroare la încărcarea datelor pentru dashboard: ' + error.message);
        this.loadingService.setLoading(false);
      }
    });
  }
}
