import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterAuthorizedPersonnelComponent } from './register-authorized-personnel.component';

describe('RegisterAuthorizedPersonnelComponent', () => {
  let component: RegisterAuthorizedPersonnelComponent;
  let fixture: ComponentFixture<RegisterAuthorizedPersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterAuthorizedPersonnelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterAuthorizedPersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
