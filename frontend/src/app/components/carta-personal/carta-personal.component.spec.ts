import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartaPersonalComponent } from './carta-personal.component';

describe('CartaPersonalComponent', () => {
  let component: CartaPersonalComponent;
  let fixture: ComponentFixture<CartaPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartaPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartaPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
