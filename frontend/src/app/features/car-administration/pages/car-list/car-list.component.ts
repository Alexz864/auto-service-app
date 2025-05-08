import { Component, OnInit } from '@angular/core';
import { Car } from '../../../../core/models/car.model';
import { CarService } from '../../../../core/services/car.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss']
})
export class CarListComponent implements OnInit {
  cars: Car[] = [];
  filteredCars: Car[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  showInactive: boolean = false;

  constructor(
    private carService: CarService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(): void {
    this.loading = true;
    this.loadingService.setLoading(true, 'Se încarcă lista de mașini...');

    this.carService.getAll({ showInactive: this.showInactive }).subscribe({
      next: (data) => {
        this.cars = data;
        this.applyFilters();
        this.loading = false;
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Eroare la încărcarea mașinilor: ' + error.message);
        this.loading = false;
        this.loadingService.setLoading(false);
      }
    });
  }

  applyFilters(): void {
    this.filteredCars = this.cars.filter(car => {

      if (!this.showInactive && !car.activa) {
        return false;
      }

      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        return (
          car.registrationNumber.toLowerCase().includes(searchLower) ||
          car.brand.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower) ||
          car.chassisSeries.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  toggleShowInactive(): void {
    this.showInactive = !this.showInactive;
    this.loadCars();
  }

  onActivateCar(id: number): void {
    this.loadingService.setLoading(true, 'Se activează mașina...');

    this.carService.activate(id).subscribe({
      next: () => {
        const car = this.cars.find(m => m.id === id);
        if (car) {
          car.activa = true;
        }
        this.applyFilters();
        this.notificationService.showSuccess('Mașina a fost activată cu succes!');
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Eroare la activarea mașinii: ' + error.message);
        this.loadingService.setLoading(false);
      }
    });
  }

  onDeactivateCar(id: number): void {
    this.loadingService.setLoading(true, 'Se dezactivează mașina...');

    this.carService.deactivate(id).subscribe({
      next: () => {
        const car = this.cars.find(m => m.id === id);
        if (car) {
          car.activa = false;
        }
        this.applyFilters();
        this.notificationService.showSuccess('Mașina a fost dezactivată cu succes!');
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Eroare la dezactivarea mașinii: ' + error.message);
        this.loadingService.setLoading(false);
      }
    });
  }

  onDeleteCar(id: number): void {
    if (confirm('Sunteți sigur că doriți să ștergeți această mașină? Această acțiune nu poate fi anulată.')) {
      this.loadingService.setLoading(true, 'Se șterge mașina...');

      this.carService.delete(id).subscribe({
        next: () => {
          this.cars = this.cars.filter(m => m.id !== id);
          this.applyFilters();
          this.notificationService.showSuccess('Mașina a fost ștearsă cu succes!');
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la ștergerea mașinii: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }
}
