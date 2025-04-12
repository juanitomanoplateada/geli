import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterSessionComponent } from './register-session.component';

describe('RegisterSessionComponent', () => {
  let component: RegisterSessionComponent;
  let fixture: ComponentFixture<RegisterSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterSessionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
