import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { UserSessionService } from '../../core/auth/services/user-session.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  username: string = '';
  roles: string[] = [];
  activeSubmenu: string | null = null;
  sidebarOpen: boolean = false;

  constructor(private router: Router, private session: UserSessionService) {}

  ngOnInit() {
    this.username = this.session.getUsername() ?? 'USUARIO';
    this.roles = this.session.getRoles();
  }

  hasRole(allowed: string[]): boolean {
    return this.roles.some((role) => allowed.includes(role));
  }

  toggleSubmenu(menu: string): void {
    this.activeSubmenu = this.activeSubmenu === menu ? null : menu;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isSubmenuOpen(menu: string): boolean {
    const menuRoutes: { [key: string]: string[] } = {
      users: ['/dashboard/users'],
      laboratories: ['/dashboard/laboratories'],
      'equipments-patterns': ['/dashboard/equipments-patterns'],
      reports: ['/dashboard/reports'],
      sessions: ['/dashboard/sessions'],
    };
    return (
      this.activeSubmenu === menu ||
      menuRoutes[menu]?.some((r) => this.router.url.includes(r))
    );
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  isExactActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    this.session.logout();
    this.router.navigate(['/auth/login']);
  }

  getTranslatedRole(): string {
    const translations: { [key: string]: string } = {
      'AUTHORIZED-USER': 'PERSONAL AUTORIZADO',
      'QUALITY-ADMIN-USER': 'ANALISTA DE CALIDAD',
    };

    const role = this.roles[0]; // puedes cambiar esto si tienes múltiples roles visibles
    return translations[role] || role;
  }
}
