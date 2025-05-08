import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

@Component({
  selector: 'app-calendar-appointments',
  templateUrl: './calendar-appointments.component.html',
  styleUrls: ['./calendar-appointments.component.scss']
})
export class CalendarAppointmentsComponent implements OnInit {
  calendarDays: CalendarDay[] = [];
  currentMonth: Date = new Date();
  weekDays: string[] = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
  shortWeekDays: string[] = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
  months: string[] = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
  appointments: Appointment[] = [];
  loading: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.loadingService.setLoading(true, 'Se încarcă programările...');

    this.appointmentService.getAll().subscribe({
      next: (data) => {
        this.appointments = data;
        this.generateCalendar();
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

  generateCalendar(): void {
    this.calendarDays = [];

    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfCalendar = new Date(firstDay);
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDay.getDay());

    const lastDayOfCalendar = new Date(lastDay);
    const daysToAdd = 6 - lastDay.getDay();
    lastDayOfCalendar.setDate(lastDayOfCalendar.getDate() + daysToAdd);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDate = new Date(firstDayOfCalendar);
    while (currentDate <= lastDayOfCalendar) {

      const currentDateStr = currentDate.toISOString().split('T')[0];
      const dayAppointments = this.appointments.filter(p => {

        const appointmentDate = new Date(p.date).toISOString().split('T')[0];
        return appointmentDate === currentDateStr;
      });

      this.calendarDays.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toISOString().split('T')[0] === today.toISOString().split('T')[0],
        appointments: dayAppointments
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  previousMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentMonth = new Date();
    this.generateCalendar();
  }

  goToAppointment(id: number): void {
    this.router.navigate(['/appointments', id]);
  }

  isCurrentOrFutureDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  calculateFinishDate(date: Date, time: number): Date {
    const finishDate = new Date(new Date(date).getTime() + time * 60000);
    return finishDate;
  }
}
