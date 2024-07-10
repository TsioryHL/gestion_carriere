import { TestBed } from '@angular/core/testing';

import { SavoiretreService } from './savoiretre.service';

describe('SavoiretreService', () => {
  let service: SavoiretreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavoiretreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
