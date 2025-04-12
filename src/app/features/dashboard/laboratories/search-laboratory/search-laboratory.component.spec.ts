import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchLaboratoryComponent } from './search-laboratory.component';

describe('SearchLaboratoryComponent', () => {
  let component: SearchLaboratoryComponent;
  let fixture: ComponentFixture<SearchLaboratoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchLaboratoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchLaboratoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
