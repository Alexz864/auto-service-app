import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Car, EngineType } from '../../../../core/models/car.model';
import { Client } from '../../../../core/models/client.model';
import { ClientService } from '../../../../core/services/client.service';
import { CarService } from '../../../../core/services/car.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-car-form',
  templateUrl: './car-form.component.html',
  styleUrls: ['./car-form.component.scss']
})
export class CarFormComponent implements OnInit {
  @Input() car: Car | null = null;
  @Input() clientId: number | null = null;
  @Input() loading: boolean = false;
  @Output() formSubmit = new EventEmitter<Car>();

  carForm: FormGroup;
  engineType = Object.values(EngineType);
  clients: Client[] = [];
  loadingClients: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private carService: CarService,
    private notificationService: NotificationService
  ) {
    this.carForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadClients();

    if (this.car) {
      this.populateForm();
    } else if (this.clientId) {
      this.carForm.patchValue({ clientId: this.clientId });
    }
  }

  ngOnChanges(): void {
    if (this.car) {
      this.populateForm();
    } else if (this.clientId) {
      this.carForm.patchValue({ clientId: this.clientId });
    }
  }

  loadClients(): void {
    this.loadingClients = true;

    this.clientService.getAll({ activ: true }).subscribe({
      next: (data) => {
        this.clients = data;
        this.loadingClients = false;
      },
      error: (error) => {
        this.notificationService.showError('Eroare la încărcarea clienților: ' + error.message);
        this.loadingClients = false;
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      clientId: [null, Validators.required],
      registrationNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{1,2}\s?[0-9]{2,3}\s?[A-Z]{3}$/)]],
      chassisSeries: ['', [Validators.required, Validators.minLength(17), Validators.maxLength(17)]],
      brand: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      model: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      yearOfManufacture: [new Date().getFullYear(), [Validators.required, Validators.min(1950), Validators.max(new Date().getFullYear() + 1)]],
      engineType: [EngineType.GASOLINE, Validators.required],
      engineCapacity: [0, [Validators.required, Validators.min(1), Validators.max(10000)]],
      horsePower: [0, [Validators.required, Validators.min(1), Validators.max(2000)]],
      kW: [0, [Validators.required, Validators.min(1), Validators.max(1500)]],
      activa: [true]
    });
  }

  populateForm(): void {
    if (this.car) {
      this.carForm.patchValue({
        clientId: this.car.clientId,
        registrationNumber: this.car.registrationNumber,
        chassisSeries: this.car.chassisSeries,
        brand: this.car.brand,
        model: this.car.model,
        yearOfManufacture: this.car.yearOfManufacture,
        engineType: this.car.engineType,
        engineCapacity: this.car.engineCapacity,
        horsePower: this.car.horsePower,
        kW: this.car.kW,
        activa: this.car.activa
      });
    }
  }

  onHorsePowerChange(): void {
    const horsePower = this.carForm.get('horsePower')?.value;
    if (horsePower) {
      const kw = this.carService.calculateKwFromHp(horsePower);
      this.carForm.get('kW')?.setValue(kw);
    }
  }

  onKwChange(): void {
    const kw = this.carForm.get('kW')?.value;
    if (kw) {
      const hp = this.carService.calculateHpFromKw(kw);
      this.carForm.get('horsePower')?.setValue(hp);
    }
  }

  onSubmit(): void {
    if (this.carForm.valid) {
      const carData: Car = this.carForm.value;
      this.formSubmit.emit(carData);
    } else {

      Object.keys(this.carForm.controls).forEach(key => {
        const control = this.carForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
