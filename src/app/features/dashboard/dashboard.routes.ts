import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { usersRoutes } from './users/users.routes';
import { laboratoriesRoutes } from './laboratories/laboratories.routes';
import { equipmentsPatternsRoutes } from './equipments-patterns/equipments-patterns.routes';
import { sessionsRoutes } from './sessions/sessions.routes';
import { reportsRoutes } from './reports/reports.routes';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { KeycloakRoleGuard } from '../../core/auth/keycloak-role.guard';
import { AssignEquipmentPermissionsComponent } from './assign-equipment-permissions/assign-equipment-permissions.component';
import { SessionReportComponent } from './reports/session-report/session-report.component';

export const dashboardRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'assign-equipment-permissions',
    canActivate: [KeycloakRoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    component: AssignEquipmentPermissionsComponent,
  },
  {
    path: 'users',
    canActivate: [KeycloakRoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    children: usersRoutes,
  },
  {
    path: 'laboratories',
    canActivate: [KeycloakRoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    children: laboratoriesRoutes,
  },
  {
    path: 'equipments-patterns',
    canActivate: [KeycloakRoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    children: equipmentsPatternsRoutes,
  },
  {
    path: 'sessions',
    children: sessionsRoutes,
  },
  {
    path: 'reports',
    canActivate: [KeycloakRoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    children: reportsRoutes,
  },
  {
    path: 'user-profile',
    canActivate: [KeycloakRoleGuard],
    data: { roles: ['AUTHORIZED-USER', 'QUALITY-ADMIN-USER'] },
    component: UserProfileComponent,
  },
  {
    path: 'session-report',
    canActivate: [KeycloakRoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    component: SessionReportComponent,
  },
];
