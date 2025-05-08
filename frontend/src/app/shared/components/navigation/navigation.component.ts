import { Component } from '@angular/core';

interface NavItem {
  title: string;
  link: string;
  icon: string;
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  navItems: NavItem[] = [
    { title: 'Dashboard', link: '/dashboard', icon: 'bi-speedometer2' },
    { title: 'Clienți', link: '/clients', icon: 'bi-people' },
    { title: 'Mașini', link: '/cars', icon: 'bi-car-front' },
    { title: 'Piese', link: '/parts', icon: 'bi-gear' },
    { title: 'Programări', link: '/appointments', icon: 'bi-calendar-week' },
    { title: 'Istoric Service', link: '/istoric', icon: 'bi-clipboard-check' }
  ];
}
