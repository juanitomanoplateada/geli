import { Routes } from '@angular/router';
import { SearchEquipmentPatternComponent } from './search-equipment-pattern/search-equipment-pattern.component';
import { RegisterEquipmentPatternComponent } from './register-equipment-pattern/register-equipment-pattern.component';
import { BrandsComponent } from './brands/brands.component';
import { FunctionsComponent } from './functions/functions.component';
import { UpdateEquipmentComponent } from './update-equipment/update-equipment.component';

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
    path: 'update-equipment/:id',
    component: UpdateEquipmentComponent,
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
