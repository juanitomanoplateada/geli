import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSearchEntityObjComponent } from './dropdown-search-entity-obj.component';

describe('DropdownSearchEntityObjComponent', () => {
  let component: DropdownSearchEntityObjComponent;
  let fixture: ComponentFixture<DropdownSearchEntityObjComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownSearchEntityObjComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownSearchEntityObjComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
