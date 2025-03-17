import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasarelaDePagoComponent } from './pasarela-de-pago.component';

describe('PasarelaDePagoComponent', () => {
  let component: PasarelaDePagoComponent;
  let fixture: ComponentFixture<PasarelaDePagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasarelaDePagoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasarelaDePagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
