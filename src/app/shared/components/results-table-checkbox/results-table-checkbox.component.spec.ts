import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsTableCheckboxComponent } from './results-table-checkbox.component';

describe('ResultsTableCheckboxComponent', () => {
  let component: ResultsTableCheckboxComponent;
  let fixture: ComponentFixture<ResultsTableCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsTableCheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultsTableCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
