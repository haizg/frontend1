import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password-modal.html',
  styleUrls: ['./forgot-password-modal.css']
})
export class ForgotPasswordModal {
  @Output() closeModal = new EventEmitter<void>();

  // Component state
  isVisible = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  email = '';

  constructor(private http: HttpClient) {}

  open() {
    this.isVisible = true;

    this.email = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
  }

  close() {
    this.isVisible = false;

    this.email = '';
    this.errorMessage = '';
    this.successMessage = '';

    this.closeModal.emit();
  }


  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || this.email.trim() === '') {
      this.errorMessage = 'Veuillez entrer votre email';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Format email invalide';
      return;
    }

    this.isLoading = true;


    this.http.post('http://localhost:8081/api/auth/forgot-password', {
      email: this.email
    }).subscribe({
      next: (response: any) => {
        console.log('Password reset email sent:', response);

        this.successMessage = response.message || 'Un email de réinitialisation a été envoyé';
        this.isLoading = false;

        this.email = '';

        setTimeout(() => {
          this.close();
        }, 3000);
      },

      error: (error) => {
        console.error('Error sending password reset:', error);
        this.isLoading = false;

        if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'Erreur lors de l\'envoi de l\'email';
        }
      }
    });
  }
}
