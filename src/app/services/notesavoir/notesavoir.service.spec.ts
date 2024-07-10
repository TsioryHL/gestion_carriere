import { TestBed } from '@angular/core/testing';

import { NotesavoirService } from './notesavoir.service';

describe('NotesavoirService', () => {
  let service: NotesavoirService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotesavoirService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
