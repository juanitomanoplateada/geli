import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterQualityAnalystComponent } from './register-quality-analyst.component';

describe('RegisterQualityAnalystComponent', () => {
  let component: RegisterQualityAnalystComponent;
  let fixture: ComponentFixture<RegisterQualityAnalystComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterQualityAnalystComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterQualityAnalystComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
