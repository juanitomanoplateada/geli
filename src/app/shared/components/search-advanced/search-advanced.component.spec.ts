import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAdvancedComponent } from './search-advanced.component';

describe('SearchAdvancedComponent', () => {
  let component: SearchAdvancedComponent;
  let fixture: ComponentFixture<SearchAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchAdvancedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
