import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Car } from '../../../../core/models/car.model';
import { CarService } from '../../../../core/services/car.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-add-car',
  templateUrl: './add-car.component.html',
  styleUrls: ['./add-car.component.scss']
})
export class AddCarComponent implements OnInit {
  car: Car | null = null;
  clientId: number | null = null;
  loading: boolean = false;
  isEditMode: boolean = false;
  carId: number | null = null;

  constructor(
    private carService: CarService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carId = +id;
      this.isEditMode = true;
      this.loadCar();
    }

    this.route.queryParams.subscribe(params => {
      if (params['clientId']) {
        this.clientId = +params['clientId'];
      }
    });
  }

  loadCar(): void {
    if (this.carId) {
      this.loading = true;
      this.loadingService.setLoading(true, 'Se încarcă datele mașinii...');

      this.carService.getById(this.carId).subscribe({
        next: (data) => {
          this.car = data;
          this.clientId = data.clientId;
          this.loading = false;
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la încărcarea mașinii: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/cars']);
        }
      });
    }
  }

  onSubmit(carData: Car): void {
    this.loading = true;
    this.loadingService.setLoading(true, this.isEditMode ? 'Se actualizează mașina...' : 'Se adaugă mașina...');

    if (this.isEditMode && this.carId) {
      this.carService.update(this.carId, carData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Mașina a fost actualizată cu succes!');
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/cars', this.carId]);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la actualizarea mașinii: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
        }
      });
    } else {
      this.carService.create(carData).subscribe({
        next: (result) => {
          this.notificationService.showSuccess('Mașina a fost adăugată cu succes!');
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/cars', result.id]);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la adăugarea mașinii: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
        }
      });
    }
  }
}
