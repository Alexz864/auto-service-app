import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IstoricService, IstoricReceiveCar, IstoricProcessingCar, UsedPart } from '../../../../core/models/istoric-service.model';
import { Appointment } from '../../../../core/models/appointment.model';
import { IstoricServiceService } from '../../../../core/services/istoric-service.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ClientService } from '../../../../core/services/client.service';
import { CarService } from '../../../../core/services/car.service';
import { PartService } from '../../../../core/services/part.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { forkJoin, of, Observable } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-istoric-details',
  templateUrl: './istoric-details.component.html',
  styleUrls: ['./istoric-details.component.scss']
})
export class IstoricDetailsComponent implements OnInit {
  istoric: IstoricService | null = null;
  appointment: Appointment | null = null;
  clientName: string = '';
  carDetails: string = '';
  usedParts: UsedPart[] = [];
  loading: boolean = false;
  istoricId: number | null = null;

  editingReceive: boolean = false;
  editingProcessing: boolean = false;
  loadingReceive: boolean = false;
  loadingProcessing: boolean = false;

  constructor(
    private istoricService: IstoricServiceService,
    private appointmentService: AppointmentService,
    private clientService: ClientService,
    private carService: CarService,
    private partService: PartService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.istoricId = +id;
      this.loadIstoricDetails();
    } else {
      this.router.navigate(['/istoric']);
    }
  }

  loadIstoricDetails(): void {
    if (this.istoricId) {
      this.loading = true;
      this.loadingService.setLoading(true, 'Se încarcă detaliile istoricului...');

      this.istoricService.getById(this.istoricId).subscribe({
        next: (istoric) => {
          this.istoric = istoric;

          if (istoric.appointmentId) {
            this.appointmentService.getById(istoric.appointmentId).subscribe({
              next: (appointment) => {
                this.appointment = appointment;

                forkJoin([
                  this.clientService.getById(appointment.clientId),
                  this.carService.getById(appointment.carId)
                ]).subscribe({
                  next: ([client, car]) => {
                    this.clientName = `${client.last_name} ${client.first_name}`;
                    this.carDetails = `${car.brand} ${car.model} (${car.registrationNumber})`;

                    if (istoric.processingCar && istoric.processingCar.id) {
                      const processingId = istoric.processingCar.id;
                      this.tryLoadParts(processingId);
                    } else {
                      this.usedParts = [];
                    }
                    this.loading = false;
                    this.loadingService.setLoading(false);
                  },
                  error: (error) => {
                    console.error('Eroare la încărcarea datelor client/mașină:', error);
                    this.loading = false;
                    this.loadingService.setLoading(false);
                  }
                });
              },
              error: (error) => {
                console.error('Eroare la încărcarea programării:', error);
                this.loading = false;
                this.loadingService.setLoading(false);
              }
            });
          } else {
            this.loading = false;
            this.loadingService.setLoading(false);
          }
        },
        error: (error) => {
          console.error('Eroare la încărcarea istoricului:', error);
          this.notificationService.showError('Eroare la încărcarea detaliilor istoricului: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
        }
      });
    }
  }

  startEditReceive(): void {
    this.editingReceive = true;
  }

  cancelEditReceive(): void {
    this.editingReceive = false;
  }

  onReceiveCarUpdate(primire: IstoricReceiveCar): void {
    if (!this.istoric || !this.istoric.receiveCar || !this.istoric.id) {
      this.notificationService.showError('Datele istoricului nu sunt disponibile.');
      return;
    }

    if (!this.istoric.receiveCar.id) {
      this.notificationService.showError('ID-ul primirii nu este disponibil.');
      return;
    }

    this.loadingReceive = true;
    this.loadingService.setLoading(true, 'Se actualizează datele primirii mașinii...');

    const receiveId = this.istoric.receiveCar.id;

    this.istoricService.updateReceiveCar(this.istoric.id, receiveId, primire).subscribe({
      next: (result) => {
        if (this.istoric && this.istoric.receiveCar) {
          this.istoric.receiveCar = result;
        }

        this.editingReceive = false;
        this.notificationService.showSuccess('Datele primirii mașinii au fost actualizate cu succes!');
        this.editingReceive = false;
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        console.error('Eroare la actualizarea primirii:', error);
        this.notificationService.showError('Eroare la actualizarea datelor primirii mașinii: ' + error.message);
        this.editingReceive = false;
        this.loadingService.setLoading(false);
      }
    });
  }

  startEditProcessing(): void {
    this.editingProcessing = true;
  }

  cancelEditProcessing(): void {
    this.editingProcessing = false;
  }

  onProcessingCarUpdate(processing: IstoricProcessingCar): void {
    if (!this.istoric || !this.istoric.processingCar || !this.istoric.id) {
      this.notificationService.showError('Datele istoricului nu sunt disponibile.');
      return;
  }

  if (!this.istoric.processingCar.id) {
    this.notificationService.showError('ID-ul procesării nu este disponibil.');
    this.loadingProcessing = false;
    this.loadingService.setLoading(false);
    return;
  }

  this.loadingProcessing = true;
  this.loadingService.setLoading(true, 'Se actualizează datele procesării mașinii...');

  const processingId = this.istoric.processingCar.id;
  const istoricId = this.istoric.id;

  this.istoricService.updateProcessingCar(istoricId, processingId, processing).subscribe({
    next: (result) => {

      if (this.istoric && this.istoric.processingCar) {
        this.istoric.processingCar = result;

        if (result && result.id) {
          const updatedProcessingCar = result.id;
          this.tryLoadParts(updatedProcessingCar);
        } else {
          console.error('ID-ul procesării actualizate nu este disponibil');
          if (processingId) {
            this.tryLoadParts(processingId);
          }
        }
      }

      this.editingProcessing = false;
      this.notificationService.showSuccess('Datele procesării mașinii au fost actualizate cu succes!');
      this.loadingProcessing = false;
      this.loadingService.setLoading(false);
    },
    error: (error) => {
      console.error('Eroare la actualizarea procesării:', error);
      this.notificationService.showError('Eroare la actualizarea datelor procesării mașinii: ' + error.message);
      this.loadingProcessing = false;
      this.loadingService.setLoading(false);
    }
  });
}

  tryLoadParts(processingId: number): void {
    if (!processingId) {
      console.error('ID-ul procesării nu este valid:', processingId);
      return;
    }

    this.partService.getProcessingParts(processingId)
      .pipe(
        catchError(error => {
          console.error(`Eroare la încărcarea pieselor pentru procesarea ${processingId}:`, error);
          return of([]);
        })
      )
      .subscribe(processingParts => {
        if (processingParts && processingParts.length > 0) {
          this.usedParts = processingParts.map(part => ({
            partId: part.id || part.partId,
            quantity: part.UsedPart?.quantity || 1,
            name: part.name,
            code: part.code,
            price: part.price || 0
          }));
        } else {
          this.usedParts = [];
        }
      });
  }

  fallbackLoadParts(istoric: IstoricService): void {

    if (istoric.processingCar &&
        istoric.processingCar.usedParts &&
        istoric.processingCar.usedParts.length > 0) {

      const partsObservables = istoric.processingCar.usedParts.map((part) =>
        this.partService.getById(part.partId).pipe(
          map(partDetails => ({
            partId: part.partId,
            quantity: part.quantity,
            name: partDetails.name,
            code: partDetails.code,
            price: partDetails.price
          }))
        )
      );

      if (partsObservables.length > 0) {
        forkJoin(partsObservables).subscribe({
          next: completeParts => {
            if (this.usedParts.length === 0) {
              this.usedParts = completeParts;
            }
          },
          error: (error) => {
            console.error('Eroare secundară la încărcarea pieselor:', error);
          }
        });
      }
    }
  }

  loadPartsForProcessing(processingId: number): Observable<UsedPart[]> {
    return this.partService.getProcessingParts(processingId).pipe(
      switchMap(parts => {
        if (!parts || parts.length === 0) {
          return of([]);
        }

        const mappedParts = parts.map(p => ({
          partId: p.id || p.partId,
          quantity: p.UsedPart?.quantity || p.quantity || 1,
          name: p.name,
          code: p.code,
          price: p.price || 0
        }));

        return of(mappedParts);
      })
    );
  }

  getServiceTime(): number {
    if (this.istoric && this.istoric.processingCar) {
      return this.istoric.processingCar.serviceTime || 0;
    }
    return 0;
  }

  calculateTotalParts(): number {
    if (!this.usedParts || this.usedParts.length === 0) {
      return 0;
    }
    return this.usedParts.reduce((total, part) => {
      const price = part.price || 0;
      const quantity = part.quantity || 0;
      return total + (price * quantity);
    }, 0);
  }

  calculateServiceFee(): number {
    if (this.istoric && this.istoric.processingCar) {
      const durata = this.getServiceTime();
      //coost per minute is 10 RON
      return durata * 10;
    }
    return 0;
  }

  calculateGeneralTotal(): number {
    return this.calculateTotalParts() + this.calculateServiceFee();
  }

  calculateFinishDate(date: Date, time: number): Date {
    const dateFinish = new Date(new Date(date).getTime() + time * 60000);
    return dateFinish;
  }
}
