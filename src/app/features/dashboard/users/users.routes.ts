import { Routes } from '@angular/router';
import { SearchUserComponent } from './search-user/search-user.component';
import { RegisterUserComponent } from './register-user/register-user.component';
import { UpdateUserComponent } from './update-user/update-user.component';

export const usersRoutes: Routes = [
  { path: 'search-user', component: SearchUserComponent },
  { path: 'register-user', component: RegisterUserComponent },
  { path: 'update-user/:id', component: UpdateUserComponent },
];
