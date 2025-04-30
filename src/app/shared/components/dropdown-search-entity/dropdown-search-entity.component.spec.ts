import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSearchEntityComponent } from './dropdown-search-entity.component';

describe('DropdownSearchEntityComponent', () => {
  let component: DropdownSearchEntityComponent;
  let fixture: ComponentFixture<DropdownSearchEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownSearchEntityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownSearchEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
