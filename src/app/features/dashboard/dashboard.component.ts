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
  // Propiedades del componente
  username: string = '';
  roles: string[] = [];
  activeSubmenu: string | null = null;
  sidebarOpen: boolean = false;
  name: string = '';

  // Mapeo de rutas para submenús
  private readonly menuRoutes: { [key: string]: string[] } = {
    users: ['/dashboard/users'],
    laboratories: ['/dashboard/laboratories'],
    'equipments-patterns': ['/dashboard/equipments-patterns'],
    reports: ['/dashboard/reports'],
    sessions: ['/dashboard/sessions'],
  };

  // Traducciones de roles
  private readonly roleTranslations: Record<string, string> = {
    'QUALITY-ADMIN-USER': 'ANALISTA DE CALIDAD',
    'AUTHORIZED-USER': 'PERSONAL AUTORIZADO',
  };

  constructor(private router: Router, private session: UserSessionService) {}

  // ----------------------------
  // Ciclo de vida del componente
  // ----------------------------
  ngOnInit() {
    this.initializeUserData();
  }

  private initializeUserData(): void {
    this.username = this.session.getUsername() ?? 'USUARIO';
    this.roles = this.session.getRoles();
    this.name = this.session.getNameFromToken();
  }

  // ----------------------------
  // Gestión de permisos y roles
  // ----------------------------
  hasRole(allowedRoles: string[]): boolean {
    return this.roles.some((role) => allowedRoles.includes(role));
  }

  getTranslatedRole(): string {
    if (this.roles.includes('QUALITY-ADMIN-USER')) {
      return this.roleTranslations['QUALITY-ADMIN-USER'];
    }
    if (this.roles.includes('AUTHORIZED-USER')) {
      return this.roleTranslations['AUTHORIZED-USER'];
    }
    return '';
  }

  // ----------------------------
  // Gestión de navegación
  // ----------------------------
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  isExactActive(route: string): boolean {
    return this.router.url === route;
  }

  onNavigate(): void {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  logout(): void {
    this.session.logout();
    this.router.navigate(['/auth/login']);
  }

  // ----------------------------
  // Gestión del sidebar y submenús
  // ----------------------------
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleSubmenu(menu: string): void {
    this.activeSubmenu = this.activeSubmenu === menu ? null : menu;
  }

  isSubmenuOpen(menu: string): boolean {
    return (
      this.activeSubmenu === menu ||
      this.menuRoutes[menu]?.some((r) => this.router.url.includes(r))
    );
  }
}
