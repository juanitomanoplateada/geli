import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { usersRoutes } from './users/users.routes';
import { laboratoriesRoutes } from './laboratories/laboratories.routes';
import { equipmentsPatternsRoutes } from './equipments-patterns/equipments-patterns.routes';
import { sessionsRoutes } from './sessions/sessions.routes';
import { reportsRoutes } from './reports/reports.routes';
import { UserProfileComponent } from './user-profile/user-profile/user-profile.component';

export const dashboardRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'users',
    children: usersRoutes,
  },
  {
    path: 'laboratories',
    children: laboratoriesRoutes,
  },
  {
    path: 'equipments-patterns',
    children: equipmentsPatternsRoutes,
  },
  {
    path: 'sessions',
    children: sessionsRoutes,
  },
  {
    path: 'reports',
    children: reportsRoutes,
  },
  { path: 'user-profile', component: UserProfileComponent },
];
