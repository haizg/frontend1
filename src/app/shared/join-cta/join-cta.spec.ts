import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinCta } from './join-cta';

describe('JoinCta', () => {
  let component: JoinCta;
  let fixture: ComponentFixture<JoinCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinCta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinCta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
