import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizedPersonnelComponent } from './authorized-personnel.component';

describe('AuthorizedPersonnelComponent', () => {
  let component: AuthorizedPersonnelComponent;
  let fixture: ComponentFixture<AuthorizedPersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizedPersonnelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorizedPersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
