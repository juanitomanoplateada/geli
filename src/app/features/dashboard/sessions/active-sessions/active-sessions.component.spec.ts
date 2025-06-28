import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveSessionsComponent } from './active-sessions.component';

describe('ActiveSessionsComponent', () => {
  let component: ActiveSessionsComponent;
  let fixture: ComponentFixture<ActiveSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveSessionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
