import { Component } from '@angular/core';
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
  activeSubmenu: string | null = null;
  sidebarOpen: boolean = false;

  constructor(private router: Router) {}

  toggleSubmenu(menu: string): void {
    this.activeSubmenu = this.activeSubmenu === menu ? null : menu;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isSubmenuOpen(menu: string): boolean {
    if (this.activeSubmenu === menu) return true;

    // Auto-abrir el menú si está en una de sus rutas
    const menuRoutes: { [key: string]: string[] } = {
      equipment: ['/dashboard/equipment-usage'],
      'authorized-personnel': ['/dashboard/authorized-personnel'],
      // ... otras secciones
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
