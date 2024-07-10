import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavoiretreComponent } from './savoiretre.component';

describe('SavoiretreComponent', () => {
  let component: SavoiretreComponent;
  let fixture: ComponentFixture<SavoiretreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavoiretreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavoiretreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
