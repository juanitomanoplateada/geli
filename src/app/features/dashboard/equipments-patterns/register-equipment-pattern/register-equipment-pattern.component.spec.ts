import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterEquipmentPatternComponent } from './register-equipment-pattern.component';

describe('RegisterEquipmentPatternComponent', () => {
  let component: RegisterEquipmentPatternComponent;
  let fixture: ComponentFixture<RegisterEquipmentPatternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterEquipmentPatternComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterEquipmentPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
