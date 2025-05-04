import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioEditarRecetasComponent } from './formulario-editar-recetas.component';

describe('FormularioEditarRecetasComponent', () => {
  let component: FormularioEditarRecetasComponent;
  let fixture: ComponentFixture<FormularioEditarRecetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioEditarRecetasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioEditarRecetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
