import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarDiasSemanaComponent } from './listar-dias-semana.component';

describe('ListarDiasSemanaComponent', () => {
  let component: ListarDiasSemanaComponent;
  let fixture: ComponentFixture<ListarDiasSemanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarDiasSemanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarDiasSemanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
