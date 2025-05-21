import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPlanesSemanalesComponent } from './listar-planes-semanales.component';

describe('ListarPlanesSemanalesComponent', () => {
  let component: ListarPlanesSemanalesComponent;
  let fixture: ComponentFixture<ListarPlanesSemanalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarPlanesSemanalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarPlanesSemanalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
