import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarProgresoComponent } from './listar-progreso.component';

describe('ListarProgresoComponent', () => {
  let component: ListarProgresoComponent;
  let fixture: ComponentFixture<ListarProgresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarProgresoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarProgresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
