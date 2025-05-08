import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IstoricService } from '../../../../core/models/istoric-service.model';
import { IstoricServiceService } from '../../../../core/services/istoric-service.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ClientService } from '../../../../core/services/client.service';
import { CarService } from '../../../../core/services/car.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface IstoricListItem {
  istoric: IstoricService;
  clientName: string;
  carDetails: string;
  appointmentDate: Date;
}

@Component({
  selector: 'app-istoric-list',
  templateUrl: './istoric-list.component.html',
  styleUrls: ['./istoric-list.component.scss']
})
export class IstoricListComponent implements OnInit {
  istoricItems: IstoricListItem[] = [];
  filteredIstoricItems: IstoricListItem[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  selectedStatus: string = '';
  appointmentId: number | null = null;
  carId: number | null = null;
  clientId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private istoricService: IstoricServiceService,
    private appointmentService: AppointmentService,
    private clientService: ClientService,
    private carService: CarService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.appointmentId = params['appointmentId'] ? +params['appointmentId'] : null;
      this.carId = params['carId'] ? +params['carId'] : null;
      this.clientId = params['clientId'] ? +params['clientId'] : null;

      this.loadIstoric();
    });
  }

  loadIstoric(): void {
    this.loading = true;
    this.loadingService.setLoading(true, 'Se încarcă istoricul service...');

    if (this.appointmentId) {
      this.istoricService.getByAppointmentId(this.appointmentId)
        .pipe(
          switchMap(istoric => {
            if (!istoric) {
              this.istoricItems = [];
              return of(null);
            }

            return this.appointmentService.getById(istoric.appointmentId)
              .pipe(
                switchMap(appointment => {
                  const client$ = this.clientService.getById(appointment.clientId);
                  const car$ = this.carService.getById(appointment.carId);

                  return forkJoin([client$, car$])
                    .pipe(
                      switchMap(([client, car]) => {
                        this.istoricItems = [{
                          istoric: istoric,
                          clientName: `${client.last_name} ${client.first_name}`,
                          carDetails: `${car.brand} ${car.model} (${car.registrationNumber})`,
                          appointmentDate: appointment.date
                        }];
                        return of(null);
                      })
                    );
                })
              );
          })
        )
        .subscribe({
          next: () => {
            this.applyFilters();
            this.loading = false;
            this.loadingService.setLoading(false);
          },
          error: (error) => {
            this.notificationService.showError('Eroare la încărcarea istoricului: ' + error.message);
            this.loading = false;
            this.loadingService.setLoading(false);
          }
        });
    }
    else {
      this.istoricService.getAll()
        .pipe(
          switchMap(istoricItems => {
            if (istoricItems.length === 0) {
              this.istoricItems = [];
              return of([]);
            }

            const observables = istoricItems.map(istoric => {
              return this.appointmentService.getById(istoric.appointmentId)
                .pipe(
                  switchMap(appointment => {
                    const client$ = this.clientService.getById(appointment.clientId);
                    const car$ = this.carService.getById(appointment.carId);

                    return forkJoin([client$, car$])
                      .pipe(
                        switchMap(([client, car]) => {
                          if ((this.clientId && appointment.clientId !== this.clientId) ||
                              (this.carId && appointment.carId !== this.carId)) {
                            return of(null);
                          }

                          return of({
                            istoric: istoric,
                            clientName: `${client.last_name} ${client.first_name}`,
                            carDetails: `${car.brand} ${car.model} (${car.registrationNumber})`,
                            appointmentDate: appointment.date
                          });
                        })
                      );
                  })
                );
            });

            return forkJoin(observables);
          })
        )
        .subscribe({
          next: (results) => {
            this.istoricItems = results.filter(item => item !== null) as IstoricListItem[];
            this.applyFilters();
            this.loading = false;
            this.loadingService.setLoading(false);
          },
          error: (error) => {
            this.notificationService.showError('Eroare la încărcarea istoricului: ' + error.message);
            this.loading = false;
            this.loadingService.setLoading(false);
          }
        });
    }
  }

  applyFilters(): void {
    this.filteredIstoricItems = this.istoricItems.filter(item => {
      if (this.selectedStatus && item.istoric.status !== this.selectedStatus) {
        return false;
      }

      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        return (
          item.clientName.toLowerCase().includes(searchLower) ||
          item.carDetails.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    this.filteredIstoricItems.sort((a, b) => {
      return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }
}
