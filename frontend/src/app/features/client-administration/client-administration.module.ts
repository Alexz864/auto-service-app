import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ClientListComponent } from './pages/client-list/client-list.component';
import { ClientDetailsComponent } from './pages/client-details/client-details.component';
import { AddClientComponent } from './pages/add-client/add-client.component';
import { FormClientComponent } from './components/form-client/form-client.component';
import { ClientCarListComponent } from './components/client-car-list/client-car-list.component';

const routes: Routes = [
  {
    path: '',
    component: ClientListComponent
  },
  {
    path: 'add',
    component: AddClientComponent
  },
  {
    path: ':id',
    component: ClientDetailsComponent
  },
  {
    path: ':id/edit',
    component: AddClientComponent
  }
];

@NgModule({
  declarations: [
    ClientListComponent,
    ClientDetailsComponent,
    AddClientComponent,
    FormClientComponent,
    ClientCarListComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ClientAdministrationiModule { }
