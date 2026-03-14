import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEventModal } from './edit-event-modal';

describe('EditEventModal', () => {
  let component: EditEventModal;
  let fixture: ComponentFixture<EditEventModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEventModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditEventModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
