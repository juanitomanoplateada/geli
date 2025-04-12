import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';
import { authRoutes } from './features/auth/auth.routes';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', children: authRoutes },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: dashboardRoutes,
  },
];
