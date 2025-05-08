import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CarListComponent } from './pages/car-list/car-list.component';
import { CarDetailsComponent } from './pages/car-details/car-details.component';
import { AddCarComponent } from './pages/add-car/add-car.component';
import { CarFormComponent } from './components/car-form/car-form.component';

const routes: Routes = [
  {
    path: '',
    component: CarListComponent
  },
  {
    path: 'add',
    component: AddCarComponent
  },
  {
    path: ':id',
    component: CarDetailsComponent
  },
  {
    path: ':id/edit',
    component: AddCarComponent
  }
];

@NgModule({
  declarations: [
    CarListComponent,
    CarDetailsComponent,
    AddCarComponent,
    CarFormComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class CarAdministrationModule { }
