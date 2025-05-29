import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoPlanesSemanalesComponent } from './listado-planes-semanales.component';

describe('ListadoPlanesSemanalesComponent', () => {
  let component: ListadoPlanesSemanalesComponent;
  let fixture: ComponentFixture<ListadoPlanesSemanalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoPlanesSemanalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoPlanesSemanalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
