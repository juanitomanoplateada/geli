import { Routes } from '@angular/router';
import { SearchEquipmentPatternComponent } from './search-equipment-pattern/search-equipment-pattern.component';
import { RegisterEquipmentPatternComponent } from './register-equipment-pattern/register-equipment-pattern.component';
import { UpdateEquipmentPatternComponent } from './update-equipment-pattern/update-equipment-pattern.component';
import { BrandsComponent } from './brands/brands.component';
import { FunctionsComponent } from './functions/functions.component';

export const equipmentsPatternsRoutes: Routes = [
  {
    path: 'search-equipment-pattern',
    component: SearchEquipmentPatternComponent,
  },
  {
    path: 'register-equipment-pattern',
    component: RegisterEquipmentPatternComponent,
  },
  {
    path: 'update-equipment-pattern/:id',
    component: UpdateEquipmentPatternComponent,
  },
  {
    path: 'brands',
    component: BrandsComponent,
  },
  {
    path: 'functions',
    component: FunctionsComponent,
  },
];
