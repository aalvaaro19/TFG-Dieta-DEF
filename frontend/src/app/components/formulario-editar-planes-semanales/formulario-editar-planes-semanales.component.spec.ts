import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioEditarPlanesSemanalesComponent } from './formulario-editar-planes-semanales.component';

describe('FormularioEditarPlanesSemanalesComponent', () => {
  let component: FormularioEditarPlanesSemanalesComponent;
  let fixture: ComponentFixture<FormularioEditarPlanesSemanalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioEditarPlanesSemanalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioEditarPlanesSemanalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
