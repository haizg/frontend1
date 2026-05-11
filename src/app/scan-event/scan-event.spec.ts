import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanEvent } from './scan-event';

describe('ScanEvent', () => {
  let component: ScanEvent;
  let fixture: ComponentFixture<ScanEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanEvent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanEvent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
