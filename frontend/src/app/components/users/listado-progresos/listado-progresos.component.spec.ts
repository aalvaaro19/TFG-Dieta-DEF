import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoProgresosComponent } from './listado-progresos.component';

describe('ListadoProgresosComponent', () => {
  let component: ListadoProgresosComponent;
  let fixture: ComponentFixture<ListadoProgresosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoProgresosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoProgresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
