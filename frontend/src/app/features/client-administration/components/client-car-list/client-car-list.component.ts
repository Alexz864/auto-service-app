import { Component, Input } from '@angular/core';
import { Car } from '../../../../core/models/car.model';

@Component({
  selector: 'app-client-car-list',
  templateUrl: './client-car-list.component.html',
  styleUrls: ['./client-car-list.component.scss']
})
export class ClientCarListComponent {
  @Input() cars: Car[] = [];
  @Input() loading: boolean = false;
}
