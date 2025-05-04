import { TestBed } from '@angular/core/testing';

import { EquipmentUseService } from '../services/equipment-use.service';

describe('EquipmentUseService', () => {
  let service: EquipmentUseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EquipmentUseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
