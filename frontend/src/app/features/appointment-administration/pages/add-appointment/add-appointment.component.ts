import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Appointment } from '../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.scss']
})
export class AddAppointmentComponent implements OnInit {
  appointment: Appointment | null = null;
  clientId: number | null = null;
  carId: number | null = null;
  loading: boolean = false;
  isEditMode: boolean = false;
  appointmentId: number | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appointmentId = +id;
      this.isEditMode = true;
      this.loadAppointment();
    }

    this.route.queryParams.subscribe(params => {
      if (params['clientId']) {
        this.clientId = +params['clientId'];
      }
      if (params['carId']) {
        this.carId = +params['carId'];
      }
    });
  }

  loadAppointment(): void {
    if (this.appointmentId) {
      this.loading = true;
      this.loadingService.setLoading(true, 'Se încarcă datele programării...');

      this.appointmentService.getById(this.appointmentId).subscribe({
        next: (data) => {
          this.appointment = data;
          this.clientId = data.clientId;
          this.carId = data.carId;
          this.loading = false;
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la încărcarea programării: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/appointments']);
        }
      });
    }
  }

  onSubmit(appointmentData: Appointment): void {
    this.loading = true;
    this.loadingService.setLoading(true, this.isEditMode ? 'Se actualizează programarea...' : 'Se adaugă programarea...');

    if (this.isEditMode && this.appointmentId) {
      this.appointmentService.update(this.appointmentId, appointmentData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Programarea a fost actualizată cu succes!');
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/appointments', this.appointmentId]);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la actualizarea programării: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
        }
      });
    } else {
      this.appointmentService.create(appointmentData).subscribe({
        next: (result) => {
          this.notificationService.showSuccess('Programarea a fost adăugată cu succes!');
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/appointments', result.id]);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la adăugarea programării: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
        }
      });
    }
  }
}
