import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSearchAddableComponent } from './dropdown-search-addable.component';

describe('DropdownSearchAddableComponent', () => {
  let component: DropdownSearchAddableComponent;
  let fixture: ComponentFixture<DropdownSearchAddableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownSearchAddableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownSearchAddableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
