import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaChatComponent } from './pagina-chat.component';

describe('PaginaChatComponent', () => {
  let component: PaginaChatComponent;
  let fixture: ComponentFixture<PaginaChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
