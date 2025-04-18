import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentPatternReportComponent } from './equipment-pattern-report.component';

describe('EquipmentPatternReportComponent', () => {
  let component: EquipmentPatternReportComponent;
  let fixture: ComponentFixture<EquipmentPatternReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentPatternReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentPatternReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
