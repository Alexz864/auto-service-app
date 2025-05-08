import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { PartListComponent } from './pages/part-list/part-list.component';
import { PartDetailsComponent } from './pages/part-details/part-details.component';
import { AddPartComponent } from './pages/add-part/add-part.component';
import { PartFormComponent } from './components/part-form/part-form.component';

const routes: Routes = [
  {
    path: '',
    component: PartListComponent
  },
  {
    path: 'add',
    component: AddPartComponent
  },
  {
    path: ':id',
    component: PartDetailsComponent
  },
  {
    path: ':id/edit',
    component: AddPartComponent
  }
];

@NgModule({
  declarations: [
    PartListComponent,
    PartDetailsComponent,
    AddPartComponent,
    PartFormComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class PartAdministrationModule { }
