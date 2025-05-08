import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { IstoricListComponent } from './pages/istoric-list/istoric-list.component';
import { IstoricDetailsComponent } from './pages/istoric-details/istoric-details.component';
import { AddIstoricComponent } from './pages/add-istoric/add-istoric.component';
import { CarReceiveFormComponent } from './components/car-receive-form/car-receive-form.component';
import { ProcessingCarFormComponent } from './components/processing-car-form/processing-car-form.component';

const routes: Routes = [
  {
    path: '',
    component: IstoricListComponent
  },
  {
    path: 'add',
    component: AddIstoricComponent
  },
  {
    path: ':id',
    component: IstoricDetailsComponent
  }
];

@NgModule({
  declarations: [
    IstoricListComponent,
    IstoricDetailsComponent,
    AddIstoricComponent,
    CarReceiveFormComponent,
    ProcessingCarFormComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class IstoricServiceModule { }
