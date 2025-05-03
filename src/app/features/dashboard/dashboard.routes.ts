import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { usersRoutes } from './users/users.routes';
import { laboratoriesRoutes } from './laboratories/laboratories.routes';
import { equipmentsPatternsRoutes } from './equipments-patterns/equipments-patterns.routes';
import { sessionsRoutes } from './sessions/sessions.routes';
import { reportsRoutes } from './reports/reports.routes';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { RoleGuard } from '../../core/auth/guards/role.guard';
import { AssignEquipmentPermissionsComponent } from './assign-equipment-permissions/assign-equipment-permissions.component';

export const dashboardRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'assign-equipment-permissions',
    canActivate: [RoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    component: AssignEquipmentPermissionsComponent,
  },
  {
    path: 'users',
    canActivate: [RoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    children: usersRoutes,
  },
  {
    path: 'laboratories',
    canActivate: [RoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    children: laboratoriesRoutes,
  },
  {
    path: 'equipments-patterns',
    canActivate: [RoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    children: equipmentsPatternsRoutes,
  },
  {
    path: 'sessions',
    children: sessionsRoutes,
  },
  {
    path: 'reports',
    canActivate: [RoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    children: reportsRoutes,
  },
  {
    path: 'user-profile',
    canActivate: [RoleGuard],
    data: { roles: ['AUTHORIZED-USER', 'QUALITY-ADMIN-USER'] },
    component: UserProfileComponent,
  },
];
