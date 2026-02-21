import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpOption } from './sign-up-option';

describe('SignUpOption', () => {
  let component: SignUpOption;
  let fixture: ComponentFixture<SignUpOption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpOption]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpOption);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
