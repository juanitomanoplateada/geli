import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAdvancedFieldsComponent } from './search-advanced-fields.component';

describe('SearchAdvancedFieldsComponent', () => {
  let component: SearchAdvancedFieldsComponent;
  let fixture: ComponentFixture<SearchAdvancedFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchAdvancedFieldsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchAdvancedFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
