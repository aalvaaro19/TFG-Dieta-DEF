import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioRecetasComponent } from './formulario-recetas.component';

describe('FormularioRecetasComponent', () => {
  let component: FormularioRecetasComponent;
  let fixture: ComponentFixture<FormularioRecetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioRecetasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioRecetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
