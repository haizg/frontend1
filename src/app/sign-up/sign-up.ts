import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {response} from 'express';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  constructor(private router:Router, private http:HttpClient) {
  }

  nom='';
  prenom='';
  email='';
  mdp='';

  signUp(form:any){
    if (form.invalid){
      console.log("Form invalid!");
      return;
    }
    const newUser = {
      nom:this.nom,
      prenom:this.prenom,
      email:this.email,
      password:this.mdp
    }

    console.log("Sending user:", newUser);

    this.http.post("http://localhost:8081/api/signUpUser",newUser)
      .subscribe({
        next: (response) => {
          console.log("Signup successful, response:", response);
          this.router.navigate(['/api/home']);
        },
        error: (err) => {
          console.error("error saving user",err);
        }
      });

  }
}
