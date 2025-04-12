import { Routes } from '@angular/router';
import { RegisterSessionComponent } from './register-session/register-session.component';
import { SessionHistoryComponent } from './session-history/session-history.component';

export const sessionsRoutes: Routes = [
  {
    path: 'register-session',
    component: RegisterSessionComponent,
  },
  {
    path: 'session-history',
    component: SessionHistoryComponent,
  },
];
