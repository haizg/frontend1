import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  constructor(private router:Router) {
  }

  nom='';
  prenom='';
  email='';
  mdp='';

  signUp(){
      this.router.navigate(['/api/home']);
  }
}
