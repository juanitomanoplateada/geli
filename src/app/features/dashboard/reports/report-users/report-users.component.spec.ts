import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUsersComponent } from './report-users.component';

describe('ReportUsersComponent', () => {
  let component: ReportUsersComponent;
  let fixture: ComponentFixture<ReportUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
