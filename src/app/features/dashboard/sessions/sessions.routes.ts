import { Routes } from '@angular/router';
import { RegisterSessionComponent } from './register-session/register-session.component';
import { PersonalSessionHistoryComponent } from './personal-session-history/personal-session-history.component';
import { SessionHistoryComponent } from './session-history/session-history.component';

export const sessionsRoutes: Routes = [
  {
    path: 'register-session',
    component: RegisterSessionComponent,
  },
  {
    path: 'personal-session-history',
    component: PersonalSessionHistoryComponent,
  },
  {
    path: 'session-history',
    component: SessionHistoryComponent,
  },
];
