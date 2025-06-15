import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  isCollapsed = false;

  menuItems: MenuItem[] = [
    {
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      route: '/admin/dashboard'
    },
    {
      icon: 'fas fa-user-md',
      label: 'Doctors',
      route: '/admin/doctors'
    },
    {
      icon: 'fas fa-clock',
      label: 'Pending Doctors',
      route: '/admin/pending-doctors',
      badge: 3
    },
    {
      icon: 'fas fa-users',
      label: 'Patients',
      route: '/admin/patients'
    },
    {
      icon: 'fas fa-calendar-alt',
      label: 'Appointments',
      route: '/admin/appointments'
    }
  ];

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
  goHome() {
  this.router.navigate(['/home']);
}

}

