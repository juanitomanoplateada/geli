import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterLocationModalComponent } from './register-location-modal.component';

describe('RegisterLocationModalComponent', () => {
  let component: RegisterLocationModalComponent;
  let fixture: ComponentFixture<RegisterLocationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterLocationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterLocationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
