import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalSessionHistoryComponent } from './personal-session-history.component';

describe('PersonalSessionHistoryComponent', () => {
  let component: PersonalSessionHistoryComponent;
  let fixture: ComponentFixture<PersonalSessionHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalSessionHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalSessionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
