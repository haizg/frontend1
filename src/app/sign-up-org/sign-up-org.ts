import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sign-up-org',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './sign-up-org.html',
  styleUrl: './sign-up-org.css',
})
export class SignUpOrg {
  nom='';
  prenom='';
  adresse='';
  cin='';
  email='';

  constructor(private router:Router) {
  }

  signed(form:any){
    if (form.invalid){
      return;
    }

    this.router.navigate(['/api/home']);
  }



}
