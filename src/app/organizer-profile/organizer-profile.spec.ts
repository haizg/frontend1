import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerProfile } from './organizer-profile';

describe('OrganizerProfile', () => {
  let component: OrganizerProfile;
  let fixture: ComponentFixture<OrganizerProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizerProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
