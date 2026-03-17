import { Component,ViewChild  } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {ModalService} from '../services/modal.service';
import {UserService} from '../services/user.service';
import {CommonModule} from '@angular/common';
import { ForgotPasswordModal } from '../forgot-password-modal/forgot-password-modal';  // ✅ ADD THIS

@Component({
  selector: 'app-login',
  standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule, ForgotPasswordModal
    ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  @ViewChild(ForgotPasswordModal) forgotPasswordModal!: ForgotPasswordModal;

  message = 'Loading...';
  errorMessage='';

  constructor(private http: HttpClient,
              private router :Router,
              private modalService: ModalService,
              private userService: UserService) {}



  email="";
  password="";

  close(){
    this.modalService.closeLoginModal();
  }
 openForgotPassword() {
    this.forgotPasswordModal.open();
  }

  login(){
    this.errorMessage='';
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
          localStorage.setItem('role', payload.role);
          this.userService.setUser(userData);
          console.log('BEFORE closeLoginModal')
          this.modalService.closeLoginModal();
          console.log('AFTER closeLoginModal')
          console.log(" Saved to localStorage:", userData);

        },
        error: (err) => {
          if (err.status===403){
            this.errorMessage='Compte non vérifié';
            console.error("Account not verified yet");
          } else if (err.status === 401 || err.status===400){
            this.errorMessage='Email ou mot de passe incorrect';
          }else {
            this.errorMessage='Une erreur est survenue. Réessayer';
            console.error("Invalid Credentials")
          }
        }

      });
  }

}
