import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignEquipmentPermissionsComponent } from './assign-equipment-permissions.component';

describe('AssignEquipmentPermissionsComponent', () => {
  let component: AssignEquipmentPermissionsComponent;
  let fixture: ComponentFixture<AssignEquipmentPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignEquipmentPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignEquipmentPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
