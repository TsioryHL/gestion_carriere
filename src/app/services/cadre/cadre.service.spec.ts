import { TestBed } from '@angular/core/testing';

import { CadreService } from './cadre.service';

describe('CadreService', () => {
  let service: CadreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CadreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
