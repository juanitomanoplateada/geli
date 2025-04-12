import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateLaboratoryComponent } from './update-laboratory.component';

describe('UpdateLaboratoryComponent', () => {
  let component: UpdateLaboratoryComponent;
  let fixture: ComponentFixture<UpdateLaboratoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateLaboratoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateLaboratoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
