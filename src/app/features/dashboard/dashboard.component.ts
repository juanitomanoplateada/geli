import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  //userRole: string = 'PERSONAL_AUTORIZADO';
  userRole: string = 'ANALISTA_CALIDAD';
  activeSubmenu: string | null = null;
  sidebarOpen: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    //this.userRole = this.authService.getCurrentUserRole();
  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.userRole);
  }

  toggleSubmenu(menu: string): void {
    this.activeSubmenu = this.activeSubmenu === menu ? null : menu;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isSubmenuOpen(menu: string): boolean {
    if (this.activeSubmenu === menu) return true;
    const menuRoutes: { [key: string]: string[] } = {
      'authorized-personnel': ['/dashboard/authorized-personnel'],
      'laboratories': ['/dashboard/laboratories'],
      'equipments-patterns': ['/dashboard/equipments-patterns'],
      'reports': ['/dashboard/reports'],
      'sessions': ['/dashboard/sessions'],
    };
    return (
      menuRoutes[menu]?.some((route) => this.router.url.includes(route)) ||
      false
    );
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  isExactActive(route: string): boolean {
    return this.router.url === route;
  }
}
