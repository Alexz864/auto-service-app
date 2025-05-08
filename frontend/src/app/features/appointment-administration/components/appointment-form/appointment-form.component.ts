import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Appointment, ContactMethod } from '../../../../core/models/appointment.model';
import { Client } from '../../../../core/models/client.model';
import { Car } from '../../../../core/models/car.model';
import { ClientService } from '../../../../core/services/client.service';
import { CarService } from '../../../../core/services/car.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent implements OnInit {
  @Input() appointment: Appointment | null = null;
  @Input() clientId: number | null = null;
  @Input() carId: number | null = null;
  @Input() loading: boolean = false;
  @Output() formSubmit = new EventEmitter<Appointment>();

  appointmentForm: FormGroup;
  contactMethod = Object.values(ContactMethod);
  clients: Client[] = [];
  cars: Car[] = [];
  clientCars: Car[] = [];
  loadingData: boolean = false;
  intervaleOra: string[] = [];
  intervaleTimp: { start: string, final: string }[] = [];
  selectedDate: string = '';

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private carService: CarService,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService
  ) {
    this.appointmentForm = this.createForm();
    this.generateTimeIntervals();
  }

  ngOnInit(): void {
    this.loadInitialData();

    if (this.appointment) {
      this.populateForm();
    } else {
      if (this.clientId) {
        this.appointmentForm.patchValue({ clientId: this.clientId });
        this.appointmentForm.get('clientId')?.disable();
        this.onClientChange();
      }

      if (this.carId) {
        this.appointmentForm.patchValue({ carId: this.carId });
        this.appointmentForm.get('carId')?.disable();
      }

      const today = new Date();
      this.appointmentForm.patchValue({
        dateInput: today.toISOString().split('T')[0]
      });
      this.selectedDate = today.toISOString().split('T')[0];
    }

    this.appointmentForm.get('dateInput')?.valueChanges.subscribe(value => {
      this.selectedDate = value;
      this.checkAvailability();
    });

    this.appointmentForm.get('interval')?.valueChanges.subscribe(() => {
      this.updateTimeFromInterval();
      this.checkAvailability();
    });
  }

  loadInitialData(): void {
    this.loadingData = true;

    forkJoin({
      clients: this.clientService.getAll({ activ: true }),
      cars: this.carId ? of([]) : (this.clientId ? this.carService.getByClientId(this.clientId) : of([]))
    }).subscribe({
      next: (data) => {
        this.clients = data.clients;

        if (this.clientId && data.cars.length > 0) {
          this.clientCars = data.cars;
        }

        this.loadingData = false;
      },
      error: (error) => {
        this.notificationService.showError('Eroare la încărcarea datelor inițiale: ' + error.message);
        this.loadingData = false;
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      clientId: [{value: null, disabled: this.clientId !== null}, Validators.required],
      carId: [{value: null, disabled: this.carId !== null || this.clientCars.length === 0}, Validators.required],
      dateInput: ['', Validators.required],
      interval: ['', Validators.required],
      time: [30, Validators.required],
      problemDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      contactMethod: [ContactMethod.PHONE, Validators.required],
      status: ['programat']
    });
  }

  populateForm(): void {
    if (this.appointment) {
      const appointmentDate = new Date(this.appointment.date);
      const formattedDate = appointmentDate.toISOString().split('T')[0];

      const oraStart = appointmentDate.toTimeString().substring(0, 5);
      const oraFinal = new Date(appointmentDate.getTime() + this.appointment.time * 60000)
        .toTimeString().substring(0, 5);

      const interval = this.intervaleTimp.findIndex(
        i => i.start === oraStart && i.final === oraFinal
      );

      this.appointmentForm.patchValue({
        clientId: this.appointment.clientId,
        carId: this.appointment.carId,
        dateInput: formattedDate,
        interval: interval >= 0 ? interval.toString() : '',
        time: this.appointment.time,
        problemDescription: this.appointment.problemDescription,
        contactMethod: this.appointment.contactMethod,
        status: this.appointment.status
      });

      this.selectedDate = formattedDate;
      this.onClientChange();
    }
  }

  generateTimeIntervals(): void {
    const startHour = 8;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      this.intervaleOra.push(`${hour.toString().padStart(2, '0')}:00`);
      this.intervaleTimp.push({
        start: `${hour.toString().padStart(2, '0')}:00`,
        final: `${hour.toString().padStart(2, '0')}:30`
      });

      this.intervaleOra.push(`${hour.toString().padStart(2, '0')}:30`);
      this.intervaleTimp.push({
        start: `${hour.toString().padStart(2, '0')}:30`,
        final: `${(hour+1).toString().padStart(2, '0')}:00`
      });
    }
  }

  onClientChange(): void {
    const clientId = this.appointmentForm.get('clientId')?.value;
    if (clientId) {
      this.loadingData = true;

      this.carService.getByClientId(clientId).subscribe({
        next: (cars) => {
          this.clientCars = cars;

          const carIdControl = this.appointmentForm.get('carId');
          if (cars.length === 0) {
            carIdControl?.disable();
          } else if (!this.carId) {
            carIdControl?.enable();

            if (cars.length === 1) {
              this.appointmentForm.patchValue({ carId: cars[0].id });
            }
          }

          this.loadingData = false;
        },
        error: (error) => {
          this.notificationService.showError('Eroare la încărcarea mașinilor clientului: ' + error.message);
          this.loadingData = false;
        }
      });
    } else {
      this.clientCars = [];

      const carIdControl = this.appointmentForm.get('carId');
      carIdControl?.setValue(null);
      carIdControl?.disable();
    }
  }

  updateTimeFromInterval(): void {
    const intervalIndex = parseInt(this.appointmentForm.get('interval')?.value, 10);
    if (!isNaN(intervalIndex) && intervalIndex >= 0 && intervalIndex < this.intervaleTimp.length) {
      const interval = this.intervaleTimp[intervalIndex];
      const dateStr = this.appointmentForm.get('dateInput')?.value;

      if (dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);

        const [startHours, startMinutes] = interval.start.split(':').map(Number);
        const [endHours, endMinutes] = interval.final.split(':').map(Number);

        const startMinutesTotal = startHours * 60 + startMinutes;
        const endMinutesTotal = endHours * 60 + endMinutes;
        const durationMinutes = endMinutesTotal - startMinutesTotal;

        this.appointmentForm.patchValue({
          time: durationMinutes
        });
      }
    }
  }

  checkAvailability(): void {
    const dateStr = this.appointmentForm.get('dateInput')?.value;
    const intervalIndex = parseInt(this.appointmentForm.get('interval')?.value, 10);
    const time = this.appointmentForm.get('time')?.value;

    if (dateStr && !isNaN(intervalIndex) && time) {
      this.loadingData = true;

      const [year, month, day] = dateStr.split('-').map(Number);
      const interval = this.intervaleTimp[intervalIndex];
      const [hours, minutes] = interval.start.split(':').map(Number);

      const appointmentDate = new Date(year, month - 1, day, hours, minutes);
      const dateISO = appointmentDate.toISOString();

      this.appointmentService.verifyDisponibility(dateISO, time).subscribe({
        next: (disponibil) => {
          if (!disponibil) {
            this.notificationService.showWarning('Intervalul selectat nu este disponibil. Vă rugăm să alegeți alt interval.');
          }
          this.loadingData = false;
        },
        error: (error) => {
          this.notificationService.showError('Eroare la verificarea disponibilității: ' + error.message);
          this.loadingData = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const values = this.appointmentForm.getRawValue();

      const dateStr = values.dateInput;
      const intervalIndex = parseInt(values.interval, 10);

      if (dateStr && !isNaN(intervalIndex) && intervalIndex >= 0) {
        const interval = this.intervaleTimp[intervalIndex];
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes] = interval.start.split(':').map(Number);

        const appointmentDate = new Date(year, month - 1, day, hours, minutes);

        const appointmentData: Appointment = {
          clientId: values.clientId,
          carId: values.carId,
          date: appointmentDate,
          time: values.time,
          problemDescription: values.problemDescription,
          contactMethod: values.contactMethod,
          status: values.status || 'programat'
        };

        this.formSubmit.emit(appointmentData);
      } else {
        this.notificationService.showError('Date invalide pentru programare');
      }
    } else {
      Object.keys(this.appointmentForm.controls).forEach(key => {
        const control = this.appointmentForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  getTodayISOString(): string {
    return new Date().toISOString().split('T')[0];
  }

  isValidDate(date: string): boolean {
    return Boolean(date && date.length > 0);
  }

  calculateFinishDate(date: Date, time: number): Date {
    const finishDate = new Date(new Date(date).getTime() + time * 60000);
    return finishDate;
  }
}
