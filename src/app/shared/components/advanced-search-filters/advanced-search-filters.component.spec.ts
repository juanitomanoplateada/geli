import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSearchFiltersComponent } from './advanced-search-filters.component';

describe('AdvancedSearchFiltersComponent', () => {
  let component: AdvancedSearchFiltersComponent;
  let fixture: ComponentFixture<AdvancedSearchFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedSearchFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedSearchFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
