import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';
import { authRoutes } from './features/auth/auth.routes';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { FallbackGuard } from './core/auth/guards/fallback.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', children: authRoutes },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: dashboardRoutes,
  },
  {
    path: '**',
    loadComponent: () =>
      import(
        './shared/components/fallback-redirect/fallback-redirect.component'
      ).then((m) => m.FallbackRedirectComponent),
  },
];
