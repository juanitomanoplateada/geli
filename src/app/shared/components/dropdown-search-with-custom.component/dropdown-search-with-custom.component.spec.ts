import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSearchWithCustomComponent } from './dropdown-search-with-custom.component';

describe('DropdownSearchWithCustomComponent', () => {
  let component: DropdownSearchWithCustomComponent;
  let fixture: ComponentFixture<DropdownSearchWithCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownSearchWithCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownSearchWithCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
