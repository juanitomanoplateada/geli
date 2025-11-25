import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';
import { KeycloakAuthGuard } from './core/auth/keycloak-auth.guard';
import { FallbackRedirectComponent } from './shared/components/fallback-redirect/fallback-redirect.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [KeycloakAuthGuard],
    children: dashboardRoutes,
  },
  { path: '**', component: FallbackRedirectComponent },
];
