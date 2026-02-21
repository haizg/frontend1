import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sign-up-option',
  standalone: true,
  imports: [],
  templateUrl: './sign-up-option.html',
  styleUrl: './sign-up-option.css',
})
export class SignUpOption {
  constructor(private router:Router) {
  }

  participant(){
    this.router.navigate(['/api/signup']);
  }
  organisateur(){
    this.router.navigate(['/api/signuporg']);
  }

}
