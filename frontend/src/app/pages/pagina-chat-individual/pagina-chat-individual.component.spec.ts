import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaChatIndividualComponent } from './pagina-chat-individual.component';

describe('PaginaChatIndividualComponent', () => {
  let component: PaginaChatIndividualComponent;
  let fixture: ComponentFixture<PaginaChatIndividualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaChatIndividualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaChatIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
