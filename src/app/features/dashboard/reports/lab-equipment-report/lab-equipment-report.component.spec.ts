import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabEquipmentReportComponent } from './lab-equipment-report.component';

describe('LabEquipmentReportComponent', () => {
  let component: LabEquipmentReportComponent;
  let fixture: ComponentFixture<LabEquipmentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabEquipmentReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabEquipmentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
