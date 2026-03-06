import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {ModalService} from '../services/modal.service';

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

  constructor(private http: HttpClient, private router :Router, private modalService: ModalService) {}



  email="";
  password="";

  close(){
    this.modalService.closeLoginModal();
  }


  login(){
    const body={
      email:this.email,
      password:this.password
    };

    this.http.post('http://localhost:8081/api/auth/login', body, { responseType: 'text' })
      .subscribe({
        next:(token)=> {
          console.log("Token received:", token);

          localStorage.setItem('token',token);

          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log(" Full JWT Payload:", payload);
          console.log(" Role from payload:", payload.role);
          console.log(" Nom from payload:", payload.nom);
          console.log(" Prenom from payload:", payload.prenom);

          const userData = {
            email: payload.sub,
            nom: payload.nom || '',
            prenom: payload.prenom || '',
            role: payload.role || ''
          };

          console.log(" User data object:", userData);

          localStorage.setItem('user', JSON.stringify(userData));

          const savedUser = localStorage.getItem('user');
          console.log(" Saved to localStorage:", savedUser);
          this.modalService.closeLoginModal();
          this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
            this.router.navigate(['/api/home']);
          });



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
