import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { authorizedPersonnelRoutes } from './authorized-personnel/authorized-personnel.routes';
import { laboratoriesRoutes } from './laboratories/laboratories.routes';
import { equipmentsPatternsRoutes } from './equipments-patterns/equipments-patterns.routes';
import { sessionsRoutes } from './sessions/sessions.routes';
import { reportsRoutes } from './reports/reports.routes';

export const dashboardRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  {
    path: 'authorized-personnel',
    children: authorizedPersonnelRoutes,
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
];
