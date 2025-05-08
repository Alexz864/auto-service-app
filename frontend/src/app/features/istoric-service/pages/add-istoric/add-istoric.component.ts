
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IstoricReceiveCar, IstoricProcessingCar } from '../../../../core/models/istoric-service.model';
import { Appointment } from '../../../../core/models/appointment.model';
import { IstoricServiceService } from '../../../../core/services/istoric-service.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ClientService } from '../../../../core/services/client.service';
import { CarService } from '../../../../core/services/car.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-add-istoric',
  templateUrl: './add-istoric.component.html',
  styleUrls: ['./add-istoric.component.scss']
})
export class AddIstoricComponent implements OnInit {
  appointment: Appointment | null = null;
  clientName: string = '';
  carDetails: string = '';
  istoricId: number | null = null;
  receiveCar: IstoricReceiveCar | null = null;
  processingCar: IstoricProcessingCar | null = null;
  loading: boolean = false;
  loadingReceive: boolean = false;
  loadingProcessing: boolean = false;
  activePanelReceive: boolean = true;
  activePanelProcessing: boolean = false;
  appointmentId: number | null = null;

  constructor(
    private istoricService: IstoricServiceService,
    private appointmentService: AppointmentService,
    private clientService: ClientService,
    private carService: CarService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['appointmentId']) {
        this.appointmentId = +params['appointmentId'];
        this.loadData();
      } else {
        console.error('No appointmentId provided in query params');
        this.notificationService.showError('Nu s-a specificat nicio programare pentru crearea istoricului.');
        this.router.navigate(['/appointments']);
      }
    });
  }

  loadData(): void {
    if (this.appointmentId) {
      this.loading = true;
      this.loadingService.setLoading(true, 'Se încarcă datele pentru istoric...');

      this.appointmentService.getById(this.appointmentId)
        .pipe(
          catchError(error => {
            console.error('Error loading appointment:', error);
            this.notificationService.showError('Eroare la încărcarea programării: ' + (error.message || 'Eroare necunoscută'));
            this.loading = false;
            this.loadingService.setLoading(false);
            this.router.navigate(['/appointments']);
            return of(null);
          })
        )
        .subscribe({
          next: (appointment) => {
            if (!appointment) {
              return;
            }
            this.appointment = appointment;

            const client$ = this.clientService.getById(appointment.clientId)
              .pipe(catchError(error => {
                console.error('Error loading client:', error);
                this.notificationService.showError('Eroare la încărcarea datelor clientului: ' + (error.message || 'Eroare necunoscută'));
                return of(null);
              }));

            const car$ = this.carService.getById(appointment.carId)
              .pipe(catchError(error => {
                console.error('Error loading car:', error);
                this.notificationService.showError('Eroare la încărcarea datelor mașinii: ' + (error.message || 'Eroare necunoscută'));
                return of(null);
              }));

            forkJoin([client$, car$]).subscribe({
              next: ([client, car]) => {
                if (!client || !car) {
                  this.loading = false;
                  this.loadingService.setLoading(false);
                  this.router.navigate(['/appointments']);
                  return;
                }
                this.clientName = `${client.last_name} ${client.first_name}`;
                this.carDetails = `${car.brand} ${car.model} (${car.registrationNumber})`;

                this.checkExistingIstoric();
              },
              error: (error) => {
                console.error('Error in forkJoin for client and car:', error);
                this.notificationService.showError('Eroare la încărcarea datelor clientului și mașinii: ' + (error.message || 'Eroare necunoscută'));
                this.loading = false;
                this.loadingService.setLoading(false);
                this.router.navigate(['/appointments']);
              }
            });
          }
        });
    }
  }

  checkExistingIstoric(): void {

    this.istoricService.getByAppointmentId(this.appointmentId!)
      .pipe(
        catchError(error => {
          console.error('Error checking historic record:', error);
          this.createIstoric();
          return of(null);
        })
      )
      .subscribe({
        next: (istoric) => {

          if (istoric) {
            this.istoricId = istoric.id ?? this.appointmentId;

            if (istoric.receiveCar) {
              this.receiveCar = istoric.receiveCar;
              this.activePanelReceive = true;
            }

            if (istoric.processingCar) {
              this.processingCar = istoric.processingCar;
              this.activePanelProcessing = true;
            }

            this.loading = false;
            this.loadingService.setLoading(false);
          } else {
            this.createIstoric();
          }
        }
      });
  }

  createIstoric(): void {
    if (this.appointmentId) {
      this.loading = true;
      this.loadingService.setLoading(true, 'Se creează istoricul...');

      this.istoricService.create(this.appointmentId)
        .pipe(
          catchError(error => {
            console.error('Error creating istoric:', error);
            this.notificationService.showError('Eroare la crearea istoricului: ' + (error.message || 'Eroare necunoscută'));
            this.loading = false;
            this.loadingService.setLoading(false);
            this.router.navigate(['/appointments']);
            return of(null);
          })
        )
        .subscribe({
          next: (istoric) => {
            if (!istoric) return;
            this.istoricId = istoric.id ?? this.appointmentId;
            this.appointmentService.updateStatus(this.appointmentId!, 'in lucru')
              .pipe(
                catchError(error => {
                  console.error('Error updating appointment status:', error);
                  this.notificationService.showWarning('Istoricul a fost creat, dar statusul programării nu a putut fi actualizat.');
                  return of(null);
                })
              )
              .subscribe({
                next: () => {
                  if (this.appointment) {
                    this.appointment.status = 'in lucru';
                  }
                  this.notificationService.showSuccess('Istoricul a fost creat cu succes!');
                },
                complete: () => {
                  this.loading = false;
                  this.loadingService.setLoading(false);
                }
              });
          }
        });
    }
  }

  onReceiveCarSubmit(receive: IstoricReceiveCar): void {
    if (!this.istoricId) {
      console.error('Cannot submit receive car form: Istoric ID is null');
      this.notificationService.showError('ID-ul istoricului nu este disponibil.');
      return;
    }
    this.loadingReceive = true;
    this.loadingService.setLoading(true, 'Se salvează datele primirii mașinii...');

    if (!receive.appointmentId && this.appointmentId) {
      receive.appointmentId = this.appointmentId;
    }

    this.istoricService.addReceiveCar(this.istoricId, receive)
      .pipe(
        catchError(error => {
          console.error('Error saving receive car data:', error);
          this.notificationService.showError('Eroare la salvarea datelor primirii mașinii: ' + (error.message || 'Eroare necunoscută'));
          this.loadingReceive = false;
          this.loadingService.setLoading(false);
          return of(null);
        })
      )
      .subscribe({
        next: (result) => {
          if (!result) return;
          this.receiveCar = result;
          this.activePanelReceive = false;
          this.activePanelProcessing = true;
          this.notificationService.showSuccess('Datele primirii mașinii au fost salvate cu succes!');
        },
        complete: () => {
          this.loadingReceive = false;
          this.loadingService.setLoading(false);
        }
      });
  }

  onProcessingCarSubmit(processing: IstoricProcessingCar): void {
    if (!this.istoricId) {
      console.error('Cannot submit processing car form: Istoric ID is null');
      this.notificationService.showError('ID-ul istoricului nu este disponibil.');
      return;
    }
    this.loadingProcessing = true;
    this.loadingService.setLoading(true, 'Se salvează datele procesării mașinii...');

    if (!processing.appointmentId && this.appointmentId) {
      processing.appointmentId = this.appointmentId;
    }

    this.istoricService.addProcessingCar(this.istoricId, processing)
      .pipe(
        catchError(error => {
          console.error('Error saving processing car data:', error);
          this.notificationService.showError('Eroare la salvarea datelor procesării mașinii: ' + (error.message || 'Eroare necunoscută'));
          this.loadingProcessing = false;
          this.loadingService.setLoading(false);
          return of(null);
        })
      )
      .subscribe({
        next: (result) => {
          if (!result) return;
          this.processingCar = result;
          this.activePanelProcessing = false;

          this.appointmentService.updateStatus(this.appointmentId!, 'finalizat')
            .pipe(
              catchError(error => {
                console.error('Error updating appointment status:', error);
                this.notificationService.showWarning('Datele au fost salvate, dar actualizarea statusului programării a eșuat.');
                return of(null);
              })
            )
            .subscribe({
              next: () => {
                this.istoricService.updateStatus(this.istoricId!, 'finalizat')
                  .pipe(
                    catchError(error => {
                      console.error('Error updating istoric status:', error);
                      this.notificationService.showWarning('Datele au fost salvate, dar actualizarea statusului istoricului a eșuat.');
                      return of(null);
                    })
                  )
                  .subscribe({
                    next: () => {
                      this.notificationService.showSuccess('Datele procesării mașinii au fost salvate cu succes!');
                      this.router.navigate(['/istoric', this.istoricId]);
                    },
                    complete: () => {
                      this.loadingProcessing = false;
                      this.loadingService.setLoading(false);
                    }
                  });
              },
              error: () => {
                this.loadingProcessing = false;
                this.loadingService.setLoading(false);
              }
            });
        }
      });
  }

  calculateFinishDate(date: Date, time: number): Date {
    const finishDate = new Date(new Date(date).getTime() + time * 60000);
    return finishDate;
  }
}
