import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaSemanaFormularioComponent } from './dia-semana-formulario.component';

describe('DiaSemanaFormularioComponent', () => {
  let component: DiaSemanaFormularioComponent;
  let fixture: ComponentFixture<DiaSemanaFormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiaSemanaFormularioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiaSemanaFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
