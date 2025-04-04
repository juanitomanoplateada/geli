import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCodeComponent } from './confirm-code.component';

describe('ConfirmCodeComponent', () => {
  let component: ConfirmCodeComponent;
  let fixture: ComponentFixture<ConfirmCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
