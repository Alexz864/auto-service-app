import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Appointment, ContactMethod } from '../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ClientService } from '../../../../core/services/client.service';
import { CarService } from '../../../../core/services/car.service';
import { IstoricServiceService } from '../../../../core/services/istoric-service.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-appointment-details',
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./appointment-details.component.scss']
})
export class AppointmentDetailsComponent implements OnInit {
  appointment: Appointment | null = null;
  clientName: string = '';
  carDetails: string = '';
  areIstoric: boolean = false;
  loading: boolean = false;
  appointmentId: number | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private clientService: ClientService,
    private carService: CarService,
    private istoricService: IstoricServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appointmentId = +id;
      this.loadAppointmentDetails();
    } else {
      this.router.navigate(['/appointments']);
    }
  }

  loadAppointmentDetails(): void {
    if (this.appointmentId) {
      this.loading = true;
      this.loadingService.setLoading(true, 'Se încarcă detaliile programării...');

      this.appointmentService.getById(this.appointmentId)
        .pipe(
          switchMap(appointment => {
            this.appointment = appointment;

            const client$ = this.clientService.getById(appointment.clientId);
            const car$ = this.carService.getById(appointment.carId);
            const istoric$ = this.istoricService.getByAppointmentId(this.appointmentId!);

            return forkJoin([client$, car$, istoric$]);
          })
        )
        .subscribe({
          next: ([client, car, istoric]) => {
            this.clientName = `${client.last_name} ${client.first_name}`;
            this.carDetails = `${car.brand} ${car.model} (${car.registrationNumber})`;
            this.areIstoric = istoric != null;

            this.loading = false;
            this.loadingService.setLoading(false);
          },
          error: (error) => {
            this.notificationService.showError('Eroare la încărcarea detaliilor programării: ' + error.message);
            this.loading = false;
            this.loadingService.setLoading(false);
            this.router.navigate(['/appointments']);
          }
        });
    }
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

  onCancelAppointment(): void {
    if (this.appointmentId && confirm('Sunteți sigur că doriți să anulați această programare?')) {
      this.loadingService.setLoading(true, 'Se anulează programarea...');

      this.appointmentService.updateStatus(this.appointmentId, 'anulat').subscribe({
        next: () => {
          if (this.appointment) {
            this.appointment.status = 'anulat';
          }
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

  onDeleteAppointment(): void {
    if (this.appointmentId &&
        (this.appointment?.status === 'anulat' || this.appointment?.status === 'finalizat') &&
        confirm('Sunteți sigur că doriți să ștergeți această programare? Această acțiune nu poate fi anulată.')) {
      this.loadingService.setLoading(true, 'Se șterge programarea...');

      this.appointmentService.delete(this.appointmentId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Programarea a fost ștearsă cu succes!');
          this.loadingService.setLoading(false);
          this.router.navigate(['/appointments']);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la ștergerea programării: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }

  calculateFinishDate(dataOra: Date, durata: number): Date {
    const finishDate = new Date(new Date(dataOra).getTime() + durata * 60000);
    return finishDate;
  }
}
