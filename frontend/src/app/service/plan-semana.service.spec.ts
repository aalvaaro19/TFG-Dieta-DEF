import { TestBed } from '@angular/core/testing';

import { PlanSemanaService } from './plan-semana.service';

describe('PlanSemanaService', () => {
  let service: PlanSemanaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanSemanaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
