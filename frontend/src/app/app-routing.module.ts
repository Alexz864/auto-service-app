import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'clients',
    loadChildren: () => import('./features/client-administration/client-administration.module').then(m => m.ClientAdministrationiModule)
  },
  {
    path: 'cars',
    loadChildren: () => import('./features/car-administration/car-administration.module').then(m => m.CarAdministrationModule)
  },
  {
    path: 'parts',
    loadChildren: () => import('./features/part-administration/part-administration.module').then(m => m.PartAdministrationModule)
  },
  {
    path: 'appointments',
    loadChildren: () => import('./features/appointment-administration/appointment.module').then(m => m.AppointmentModule)
  },
  {
    path: 'istoric',
    loadChildren: () => import('./features/istoric-service/istoric-service.module').then(m => m.IstoricServiceModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
