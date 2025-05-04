import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaRecetasComponent } from './pagina-recetas.component';

describe('PaginaRecetasComponent', () => {
  let component: PaginaRecetasComponent;
  let fixture: ComponentFixture<PaginaRecetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaRecetasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaRecetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
