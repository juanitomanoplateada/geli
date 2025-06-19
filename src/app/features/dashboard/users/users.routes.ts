import { Routes } from '@angular/router';
import { SearchUserComponent } from './search-user/search-user.component';
import { RegisterUserComponent } from './register-user/register-user.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { RegisterQualityAnalystComponent } from './register-quality-analyst/register-quality-analyst.component';
import { RegisterAuthorizedPersonnelComponent } from './register-authorized-personnel/register-authorized-personnel.component';

export const usersRoutes: Routes = [
  { path: 'search-user', component: SearchUserComponent },
  { path: 'register-user', component: RegisterUserComponent },
  {
    path: 'register-quality-analyst',
    component: RegisterQualityAnalystComponent,
  },{
    path: 'register-authorized-personnel',
    component: RegisterAuthorizedPersonnelComponent,
  },
  { path: 'update-user/:id', component: UpdateUserComponent },
];
