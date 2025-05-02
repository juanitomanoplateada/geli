import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagMultiselectComponent } from './tag-multiselect.component';

describe('TagMultiselectComponent', () => {
  let component: TagMultiselectComponent;
  let fixture: ComponentFixture<TagMultiselectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagMultiselectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagMultiselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
