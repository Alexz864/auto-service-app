import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AppointmentListComponent } from './pages/appointment-list/appointment-list.component';
import { AppointmentDetailsComponent } from './pages/appointment-details/appointment-details.component';
import { AddAppointmentComponent } from './pages/add-appointment/add-appointment.component';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';
import { CalendarAppointmentsComponent } from './components/calendar-appointments/calendar-appointments.component';

const routes: Routes = [
  {
    path: '',
    component: AppointmentListComponent
  },
  {
    path: 'calendar',
    component: CalendarAppointmentsComponent
  },
  {
    path: 'add',
    component: AddAppointmentComponent
  },
  {
    path: ':id',
    component: AppointmentDetailsComponent
  },
  {
    path: ':id/edit',
    component: AddAppointmentComponent
  }
];

@NgModule({
  declarations: [
    AppointmentListComponent,
    AppointmentDetailsComponent,
    AddAppointmentComponent,
    AppointmentFormComponent,
    CalendarAppointmentsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AppointmentModule { }
