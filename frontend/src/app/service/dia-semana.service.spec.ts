import { TestBed } from '@angular/core/testing';

import { DiaSemanaService } from './dia-semana.service';

describe('DiaSemanaService', () => {
  let service: DiaSemanaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiaSemanaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
