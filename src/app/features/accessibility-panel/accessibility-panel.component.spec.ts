import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityPanelComponent } from './accessibility-panel.component';

describe('AccessibilityPanelComponent', () => {
  let component: AccessibilityPanelComponent;
  let fixture: ComponentFixture<AccessibilityPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessibilityPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessibilityPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
