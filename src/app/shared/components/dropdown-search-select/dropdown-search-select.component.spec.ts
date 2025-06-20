import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSearchSelectComponent } from './dropdown-search-select.component';

describe('DropdownSearchSelectComponent', () => {
  let component: DropdownSearchSelectComponent;
  let fixture: ComponentFixture<DropdownSearchSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownSearchSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownSearchSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
