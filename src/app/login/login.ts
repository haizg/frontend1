import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule
    ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  message = 'Loading...';

  constructor(private http: HttpClient, private router :Router) {}



  email="";
  password="";

  login(){
    const body={
      email:this.email,
      password:this.password
    };

    this.http.post('http://localhost:8081/api/auth/login', body, { responseType: 'text' })
      .subscribe({
        next:(token)=> {
          localStorage.setItem('token',token);
          const payload = JSON.parse(atob(token.split('.')[1]));//extract payload where email and role
          const role = payload.role;
          localStorage.setItem('role',role);
          console.log("log in successful",role);
          this.router.navigate(['/api/home'])
        },
        error: (err) => {
          if (err.status===403){
            console.error("Account not verified yet");
          } else {
            console.error("Invalid Credentials")
          }
        }

      });
  }
}
