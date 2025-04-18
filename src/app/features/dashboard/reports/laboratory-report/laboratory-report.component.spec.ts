import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryReportComponent } from './laboratory-report.component';

describe('LaboratoryReportComponent', () => {
  let component: LaboratoryReportComponent;
  let fixture: ComponentFixture<LaboratoryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaboratoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
