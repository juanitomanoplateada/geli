import { Routes } from '@angular/router';
import { SearchLaboratoryComponent } from './search-laboratory/search-laboratory.component';
import { RegisterLaboratoryComponent } from './register-laboratory/register-laboratory.component';
import { UpdateLaboratoryComponent } from './update-laboratory/update-laboratory.component';
import { LocationsComponent } from './locations/locations.component';

export const laboratoriesRoutes: Routes = [
  { path: 'search-laboratory', component: SearchLaboratoryComponent },
  { path: 'register-laboratory', component: RegisterLaboratoryComponent },
  { path: 'update-laboratory/:id', component: UpdateLaboratoryComponent },
  { path: 'locations', component: LocationsComponent}
];
