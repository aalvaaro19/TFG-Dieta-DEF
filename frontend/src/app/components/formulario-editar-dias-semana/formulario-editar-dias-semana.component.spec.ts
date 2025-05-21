import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioEditarDiasSemanaComponent } from './formulario-editar-dias-semana.component';

describe('FormularioEditarDiasSemanaComponent', () => {
  let component: FormularioEditarDiasSemanaComponent;
  let fixture: ComponentFixture<FormularioEditarDiasSemanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioEditarDiasSemanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioEditarDiasSemanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
