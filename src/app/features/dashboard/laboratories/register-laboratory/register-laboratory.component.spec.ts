import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterLaboratoryComponent } from './register-laboratory.component';

describe('RegisterLaboratoryComponent', () => {
  let component: RegisterLaboratoryComponent;
  let fixture: ComponentFixture<RegisterLaboratoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterLaboratoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterLaboratoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
