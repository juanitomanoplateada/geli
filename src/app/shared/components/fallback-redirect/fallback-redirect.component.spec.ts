import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FallbackRedirectComponent } from './fallback-redirect.component';

describe('FallbackRedirectComponent', () => {
  let component: FallbackRedirectComponent;
  let fixture: ComponentFixture<FallbackRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FallbackRedirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FallbackRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
