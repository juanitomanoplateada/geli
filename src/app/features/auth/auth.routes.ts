import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ConfirmCodeComponent } from './confirm-code/confirm-code.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

export const authRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'confirm-code', component: ConfirmCodeComponent },
  { path: 'change-password', component: ChangePasswordComponent },
];
