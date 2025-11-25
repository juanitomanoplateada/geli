import { Routes } from '@angular/router';
import { RegisterSessionComponent } from './register-session/register-session.component';
import { PersonalSessionHistoryComponent } from './personal-session-history/personal-session-history.component';
import { SessionHistoryComponent } from './session-history/session-history.component';
import { KeycloakRoleGuard } from '../../../core/auth/keycloak-role.guard';
import { ActiveSessionsComponent } from './active-sessions/active-sessions.component';

export const sessionsRoutes: Routes = [
  {
    path: 'register-session',
    canActivate: [KeycloakRoleGuard],
    data: { roles: ['AUTHORIZED-USER'] },
    component: RegisterSessionComponent,
  },
  {
    path: 'active-sessions',
    canActivate: [KeycloakRoleGuard],
    data: { roles: ['AUTHORIZED-USER'] },
    component: ActiveSessionsComponent,
  },
  {
    path: 'personal-session-history',
    canActivate: [KeycloakRoleGuard],
    data: { roles: ['AUTHORIZED-USER'] },
    component: PersonalSessionHistoryComponent,
  },
  {
    path: 'session-history',
    canActivate: [KeycloakRoleGuard],
    data: { roles: ['QUALITY-ADMIN-USER'] },
    component: SessionHistoryComponent,
  },
];
