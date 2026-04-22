import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateLangService } from '../services/translate-lang.service';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword implements OnInit {
  token: string = '';

  newPassword: string = '';
  confirmPassword: string = '';

  isLoading: boolean = false;
  isValidatingToken: boolean = true;
  tokenValid: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  tokenErrorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private apiService : ApiService,
    private translateLang: TranslateLangService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.tokenValid = false;
        this.isValidatingToken = false;
        this.tokenErrorMessage = 'Token manquant. Veuillez utiliser le lien envoyé par email.';
        return;
      }
      this.verifyToken();
    });
  }


  verifyToken() {
    this.isValidatingToken = true;
    this.apiService.verifyResetToken(this.token).subscribe({
        next: (response: any) => {
          this.tokenValid = response.valid === true;
          this.isValidatingToken = false;
          if (!this.tokenValid) {
            this.tokenErrorMessage = response.error || 'Token invalide';
          }
        },
        error: (error: any) => {
          this.tokenValid = false;
          this.isValidatingToken = false;
          if (error.error?.error) {
            this.tokenErrorMessage = error.error.error;
          } else {
            this.tokenErrorMessage = 'Token invalide ou expiré';
          }
        }
      });
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }
    this.isLoading = true;
    const requestBody = {
      token: this.token,
      newPassword: this.newPassword
    };

    this.apiService.resetPassword(this.token, this.newPassword).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Mot de passe réinitialisé avec succès!';
          this.newPassword = '';
          this.confirmPassword = '';
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        },
        error: (error: any) => {
          this.isLoading = false;
          if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'Erreur lors de la réinitialisation du mot de passe';
          }
        }
      });
  }
}
