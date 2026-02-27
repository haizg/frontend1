import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';

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
  role= '';

  constructor(private router:Router, private http:HttpClient) {
  }




  signed(form:any){

    console.log("form valid?", form.valid);
    console.log("role value:", this.role);

    if (form.invalid){
      return;
    }

    const newUser= {
      nom:this.nom,
      prenom:this.prenom,
      email:this.email,
      password:this.mdp,
      role:this.role
    }




    this.http.post("http://localhost:8081/api/auth/signup", newUser, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log("Signup successful:", response);
          this.router.navigate(['/api/home']);
        },
        error: (err) => {
          console.error("Signup error",err);
        }
      });
  }
}
