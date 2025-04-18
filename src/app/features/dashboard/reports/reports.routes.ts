import { Routes } from '@angular/router';
import { UserReportComponent } from './user-report/user-report.component';
import { LaboratoryReportComponent } from './laboratory-report/laboratory-report.component';
import { EquipmentPatternReportComponent } from './equipment-pattern-report/equipment-pattern-report.component';

export const reportsRoutes: Routes = [
  { path: 'user-report', component: UserReportComponent },
  { path: 'laboratory-report', component: LaboratoryReportComponent },
  { path: 'equipment-pattern-report', component: EquipmentPatternReportComponent },
];
