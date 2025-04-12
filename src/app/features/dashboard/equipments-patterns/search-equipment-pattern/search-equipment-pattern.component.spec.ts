import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchEquipmentPatternComponent } from './search-equipment-pattern.component';

describe('SearchEquipmentPatternComponent', () => {
  let component: SearchEquipmentPatternComponent;
  let fixture: ComponentFixture<SearchEquipmentPatternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchEquipmentPatternComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchEquipmentPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
