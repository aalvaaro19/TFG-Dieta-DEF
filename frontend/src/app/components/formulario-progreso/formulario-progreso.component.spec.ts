import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioProgresoComponent } from './formulario-progreso.component';

describe('FormularioProgresoComponent', () => {
  let component: FormularioProgresoComponent;
  let fixture: ComponentFixture<FormularioProgresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioProgresoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioProgresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
