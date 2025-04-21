import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownFilterComponent } from './dropdown-filter.component';

describe('DropdownFilterComponent', () => {
  let component: DropdownFilterComponent;
  let fixture: ComponentFixture<DropdownFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
