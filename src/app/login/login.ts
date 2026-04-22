import { Component,ViewChild  } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {ModalService} from '../services/modal.service';
import {UserService} from '../services/user.service';
import {CommonModule} from '@angular/common';
import { ForgotPasswordModal } from '../forgot-password-modal/forgot-password-modal';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLangService } from '../services/translate-lang.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        ForgotPasswordModal,
        TranslateModule
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
              private translateLang: TranslateLangService,
              private userService: UserService,
              private apiService: ApiService) {}

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
      password:this.password,
    };
    this.apiService.login(this.email, this.password).subscribe({
        next:(token)=> {
          localStorage.setItem('token',token);
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userData = {
            email: payload.sub,
            nom: payload.nom || '',
            prenom: payload.prenom || '',
            role: payload.role || '',
            verified: payload.verified,
            adminVerified:payload.adminVerified
          };

          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('role', payload.role);
          this.userService.setUser(userData);

          const redirect=localStorage.getItem('redirectAfterLogin');

          if (redirect){
           localStorage.removeItem('redirectAfterLogin')
           this.router.navigate([redirect]);
           }else{
             this.modalService.closeLoginModal();
           }
        },
        error: (err) => {
          console.error("Login error:", err);
                  if (err.status === 403) {
                    if (err.error?.error === 'ACCOUNT_NOT_VERIFIED') {
                      this.errorMessage = ' Veuillez vérifier votre email avant de vous connecter. Consultez votre boîte de réception.';
                    } else {
                      this.errorMessage = 'Compte non vérifié';
                    }
                  } else if (err.status === 401 || err.status === 400) {
                    this.errorMessage = 'Email ou mot de passe incorrect';
                  } else {
                    this.errorMessage = 'Une erreur est survenue. Réessayez';
                  }
                  if (err.error?.error === 'ACCOUNT_DEACTIVATED') {
                      this.errorMessage = 'Ce compte a été désactivé. Contactez support@invitini.tn pour le réactiver.';
                  }
                }
              });
          }


      goToSignup() {
        this.modalService.closeLoginModal();
        this.modalService.openSignupModal();
      }
}
