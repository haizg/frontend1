import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEventModal } from './create-event-modal';

describe('CreateEventModal', () => {
  let component: CreateEventModal;
  let fixture: ComponentFixture<CreateEventModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEventModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEventModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
