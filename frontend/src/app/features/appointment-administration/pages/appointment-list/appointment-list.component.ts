import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Appointment } from '../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ClientService } from '../../../../core/services/client.service';
import { CarService } from '../../../../core/services/car.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedData: string = '';
  clientId: number | null = null;
  carId: number | null = null;
  clientName: string = '';
  carDetails: string = '';

  today: string = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private clientService: ClientService,
    private carService: CarService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.clientId = params['clientId'] ? +params['clientId'] : null;
      this.carId = params['carId'] ? +params['carId'] : null;

      this.loadAppointments();
    });
  }

  loadAppointments(): void {
    this.loading = true;
    this.loadingService.setLoading(true, 'Se încarcă programările...');

    let clientInfo$;
    let carInfo$;

    if (this.clientId) {
      clientInfo$ = this.clientService.getById(this.clientId);
    } else {
      clientInfo$ = of(null);
    }

    if (this.carId) {
      carInfo$ = this.carService.getById(this.carId);
    } else {
      carInfo$ = of(null);
    }

    forkJoin([clientInfo$, carInfo$])
      .pipe(
        switchMap(([client, masina]) => {
          if (client) {
            this.clientName = `${client.last_name} ${client.first_name}`;
          }

          if (masina) {
            this.carDetails = `${masina.brand} ${masina.model} (${masina.registrationNumber})`;
          }

          if (this.clientId) {
            return this.appointmentService.getByClientId(this.clientId);
          } else if (this.carId) {
            return this.appointmentService.getByMasinaId(this.carId);
          } else {
            return this.appointmentService.getAll();
          }
        })
      )
      .subscribe({
        next: (data) => {
          this.appointments = data;
          this.applyFilters();
          this.loading = false;
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la încărcarea programărilor: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
        }
      });
  }

  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(appointment => {

      if (this.selectedStatus && appointment.status !== this.selectedStatus) {
        return false;
      }

      if (this.selectedData) {

        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
        if (this.selectedData === 'today') {
          if (appointmentDate !== this.today) {
            return false;
          }
        } else if (this.selectedData === 'future') {
          if (appointmentDate <= this.today) {
            return false;
          }
        } else if (this.selectedData === 'past') {
          if (appointmentDate >= this.today) {
            return false;
          }
        }
      }

      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        return (
          appointment.problemDescription.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    this.filteredAppointments.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedData = '';
    this.applyFilters();
  }

  getMethodLabel(method: string): string {
    switch (method) {
      case 'email':
        return 'Email';
      case 'telefon':
        return 'Telefon';
      case 'personal':
        return 'În persoană';
      default:
        return method;
    }
  }

  onCancelAppointment(id: number): void {
    if (confirm('Sunteți sigur că doriți să anulați această programare?')) {
      this.loadingService.setLoading(true, 'Se anulează programarea...');

      this.appointmentService.updateStatus(id, 'anulat').subscribe({
        next: () => {
          const appointment = this.appointments.find(p => p.id === id);
          if (appointment) {
            appointment.status = 'anulat';
          }
          this.applyFilters();
          this.notificationService.showSuccess('Programarea a fost anulată cu succes!');
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la anularea programării: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }

onDeleteAppointment(id: number): void {
  if (confirm('Sunteți sigur că doriți să ștergeți această programare?')) {
    this.appointmentService.delete(id).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Programarea a fost ștearsă cu succes');
        this.loadAppointments();
      },
      error: (error) => {
        console.error('Error deleting programare:', error);
        let errorMessage = 'A apărut o eroare la ștergerea programării.';

        if (error && error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error && error.message) {
          errorMessage = error.message;
        }
        this.notificationService.showError(errorMessage);
      }
    });
  }
}

  calculateFinishDate(date: Date, time: number): Date {
    const finishDate = new Date(new Date(date).getTime() + time * 60000);
    return finishDate;
  }
}
