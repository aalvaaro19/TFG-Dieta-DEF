import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioCrearPlanesSemanalesComponent } from './formulario-crear-planes-semanales.component';

describe('FormularioCrearPlanesSemanalesComponent', () => {
  let component: FormularioCrearPlanesSemanalesComponent;
  let fixture: ComponentFixture<FormularioCrearPlanesSemanalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioCrearPlanesSemanalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioCrearPlanesSemanalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
