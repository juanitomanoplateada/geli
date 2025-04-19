import { Routes } from '@angular/router';
import { UserReportComponent } from './user-report/user-report.component';
import { LaboratoryReportComponent } from './laboratory-report/laboratory-report.component';
import { LabEquipmentReportComponent } from './lab-equipment-report/lab-equipment-report.component';
import { EquipmentPatternReportComponent } from './equipment-pattern-report/equipment-pattern-report.component';
import { SessionReportComponent } from './session-report/session-report.component';

export const reportsRoutes: Routes = [
  { path: 'user-report', component: UserReportComponent },
  { path: 'laboratory-report', component: LaboratoryReportComponent },
  { path: 'lab-equipment-report', component: LabEquipmentReportComponent },
  {
    path: 'equipment-pattern-report',
    component: EquipmentPatternReportComponent,
  },
  { path: 'session-report', component: SessionReportComponent },
];
