import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpOrg } from './sign-up-org';

describe('SignUpOrg', () => {
  let component: SignUpOrg;
  let fixture: ComponentFixture<SignUpOrg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpOrg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpOrg);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
