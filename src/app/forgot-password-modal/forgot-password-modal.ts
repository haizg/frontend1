import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './forgot-password-modal.html',
  styleUrls: ['./forgot-password-modal.css']
})
export class ForgotPasswordModal {
  @Output() closeModal = new EventEmitter<void>();
  isVisible = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  email = '';

  constructor(private apiService : ApiService, private translate: TranslateService) {}

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
      this.errorMessage = this.translate.instant('forgotpassword.error_empty');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = this.translate.instant('forgotpassword.error_format');
      return;
    }

    this.isLoading = true;

    this.apiService.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        this.successMessage = response.message || this.translate.instant('forgotpassword.success');
        this.isLoading = false;
        this.email = '';
        setTimeout(() => {
          this.close();
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || this.translate.instant('forgotpassword.error_generic');
      }
    });
  }
}
