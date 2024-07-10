import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesavoirComponent } from './notesavoir.component';

describe('NotesavoirComponent', () => {
  let component: NotesavoirComponent;
  let fixture: ComponentFixture<NotesavoirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotesavoirComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotesavoirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
