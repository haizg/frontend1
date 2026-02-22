import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {response} from 'express';

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
  mdp='';
  constructor(private router:Router, private http:HttpClient) {
  }




  signed(form:any){

    const newOrg= {
      cin:this.cin,
      nom:this.nom,
      prenom:this.prenom,
      adresse:this.adresse,
      email:this.email,
      password:this.mdp

    }


    if (form.invalid){
      return;
    }

    this.http.post("http://localhost:8081/api/signUpOrg", newOrg)
      .subscribe({
        next: (response) => {
          console.log("Signup successful, response:", response);
          this.router.navigate(['/api/home']);
        },
        error: (err) => {
          console.error("error saving organizer",err);
        }
      });
  }
}
