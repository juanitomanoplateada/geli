import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEquipmentPatternComponent } from './update-equipment-pattern.component';

describe('UpdateEquipmentPatternComponent', () => {
  let component: UpdateEquipmentPatternComponent;
  let fixture: ComponentFixture<UpdateEquipmentPatternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateEquipmentPatternComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateEquipmentPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
