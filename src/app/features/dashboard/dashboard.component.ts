import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { UserSessionService } from '../../core/auth/services/user-session.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe],
})
export class DashboardComponent implements OnInit {
  // Propiedades del estado del UI
  sidebarOpen: boolean = true;
  activeSubmenu: string | null = null;

  // Datos del usuario
  username: string = '';
  name: string = '';
  roles: string[] = [];
  currentDate: Date = new Date();

  // Configuración de menús
  private readonly menuRoutes: { [key: string]: string[] } = {
    users: ['/dashboard/users'],
    laboratories: ['/dashboard/laboratories'],
    'equipments-patterns': ['/dashboard/equipments-patterns'],
    reports: ['/dashboard/reports'],
    sessions: ['/dashboard/sessions'],
  };

  private readonly roleTranslations: Record<string, string> = {
    'QUALITY-ADMIN-USER': 'Analista de Calidad',
    'AUTHORIZED-USER': 'Personal Autorizado',
    // Agrega más traducciones según necesites
  };

  constructor(
    private router: Router,
    private session: UserSessionService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.initializeSubmenus();
    this.adjustSidebarForViewport();
  }

  // ----------------------------
  // Inicialización
  // ----------------------------
  private loadUserData(): void {
    this.username = this.session.getUsername() ?? 'Usuario';
    this.roles = this.session.getRoles();
    this.name = this.session.getNameFromToken() || this.username;
  }

  private initializeSubmenus(): void {
    // Abrir automáticamente el submenú correspondiente a la ruta actual
    for (const [menu, routes] of Object.entries(this.menuRoutes)) {
      if (routes.some((route) => this.router.url.includes(route))) {
        this.activeSubmenu = menu;
        break;
      }
    }
  }

  private adjustSidebarForViewport(): void {
    if (window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
  }

  // ----------------------------
  // Gestión de permisos
  // ----------------------------
  hasRole(allowedRoles: string[]): boolean {
    return this.roles.some((role) => allowedRoles.includes(role));
  }

  getTranslatedRole(): string {
    for (const [role, translation] of Object.entries(this.roleTranslations)) {
      if (this.roles.includes(role)) {
        return translation.toUpperCase();
      }
    }
    return '';
  }

  // ----------------------------
  // Navegación y rutas
  // ----------------------------
  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }

  isExactActive(path: string): boolean {
    return this.router.url === path;
  }

  onNavigate(): void {
    if (window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
  }

  logout(): void {
    this.session.logout();
    this.router.navigate(['/auth/login']);
  }

  // ----------------------------
  // Control del Sidebar
  // ----------------------------
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;

    // Cerrar submenús cuando se cierra el sidebar
    if (!this.sidebarOpen) {
      this.activeSubmenu = null;
    }
  }

  toggleSubmenu(menu: string): void {
    // Comportamiento de acordeón (solo un submenú abierto a la vez)
    this.activeSubmenu = this.activeSubmenu === menu ? null : menu;

    // Si estamos en móvil y abrimos un submenú, asegurarse que el sidebar esté abierto
    if (
      this.activeSubmenu === menu &&
      window.innerWidth < 992 &&
      !this.sidebarOpen
    ) {
      this.sidebarOpen = true;
    }
  }

  isSubmenuOpen(menu: string): boolean {
    return (
      this.activeSubmenu === menu ||
      this.menuRoutes[menu]?.some((r) => this.router.url.includes(r))
    );
  }

  // ----------------------------
  // Helpers
  // ----------------------------
  getFormattedDate(): string {
    return this.datePipe.transform(this.currentDate, 'fullDate') || '';
  }
}
