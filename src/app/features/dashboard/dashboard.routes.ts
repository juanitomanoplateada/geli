import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { SearchUserComponent } from './authorized-personnel/search-user/search-user.component';
import { RegisterUserComponent } from './authorized-personnel/register-user/register-user.component';

export const dashboardRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  {
    path: 'authorized-personnel',
    children: [
      { path: 'search-user', component: SearchUserComponent },
      { path: 'register-user', component: RegisterUserComponent },
    ],
  },
];
