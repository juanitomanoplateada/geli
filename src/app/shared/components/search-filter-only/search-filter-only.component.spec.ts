import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFilterOnlyComponent } from './search-filter-only.component';

describe('SearchFilterOnlyComponent', () => {
  let component: SearchFilterOnlyComponent;
  let fixture: ComponentFixture<SearchFilterOnlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilterOnlyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchFilterOnlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
