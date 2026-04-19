import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalService } from '../services/modal.service';
import { UserService } from '../services/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateLangService } from '../services/translate-lang.service';

@Component({
  selector: 'app-sign-up-org',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './sign-up-org.html',
  styleUrl: './sign-up-org.css',
})
export class SignUpOrg {

  nom = '';
  prenom = '';
  email = '';
  mdp = '';
  confirmMdp = '';
  role = 'ROLE_USER';
  nomOrganisation = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  hideSuccessMessage = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private modalService: ModalService,
    private userService: UserService,
    private translate: TranslateService,
    private translateLang: TranslateLangService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  close() {
    this.modalService.closeSignupModal();
    this.resetForm();
  }

  resetForm() {
    this.nom = '';
    this.prenom = '';
    this.email = '';
    this.mdp = '';
    this.confirmMdp = '';
    this.role = 'ROLE_USER';
    this.nomOrganisation = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
    this.hideSuccessMessage = false;
  }

  signed(form: any) {
    if (form.invalid) {
      this.translate.get('signup.error_required_fields').subscribe((msg: string) => {
        this.errorMessage = msg;
      });
      return;
    }

    if (this.mdp !== this.confirmMdp) {
      this.translate.get('signup.error_password_mismatch').subscribe((msg: string) => {
        this.errorMessage = msg;
      });
      return;
    }

    if (this.role === 'ROLE_ORGANISATEUR' && !this.nomOrganisation.trim()) {
      this.translate.get('signup.error_org_name_required').subscribe((msg: string) => {
        this.errorMessage = msg;
      });
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.translate.get('signup.processing').subscribe((msg: string) => {
      this.successMessage = msg;
    });

    const newUser = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.mdp,
      role: this.role,
      nomOrganisation: this.nomOrganisation
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post(
      'http://localhost:8081/api/auth/signup',
      newUser,
      {
        headers: headers,
        responseType: 'text' as 'json'
      }
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.translate.get('signup.success_message', { email: this.email }).subscribe((msg: string) => {
          this.successMessage = msg;
        });

        setTimeout(() => {
          this.hideSuccessMessage = true;
          setTimeout(() => {
            this.modalService.closeSignupModal();
            this.router.navigate(['/home']);
          }, 500);
        }, 5000);
      },
      error: (err) => {
        console.error('Signup error:', err);
        this.isLoading = false;
        this.successMessage = '';

        if (err.status === 200) {
          this.translate.get('signup.success_message', { email: this.email }).subscribe((msg: string) => {
            this.successMessage = msg;
          });

          setTimeout(() => {
            this.hideSuccessMessage = true;
            setTimeout(() => {
              this.modalService.closeSignupModal();
              this.router.navigate(['/home']);
            }, 500);
          }, 5000);
          return;
        }

        const errorMsg = err.error?.toString() || '';

        if (err.status === 500 && (errorMsg.includes('duplicate key') || errorMsg.includes('already exists'))) {
          this.translate.get('signup.error_email_exists').subscribe((msg: string) => {
            this.errorMessage = msg;
          });
        } else if (err.status === 409) {
          this.translate.get('signup.error_email_exists').subscribe((msg: string) => {
            this.errorMessage = msg;
          });
        } else if (err.status === 400) {
          this.translate.get('signup.error_invalid_data').subscribe((msg: string) => {
            this.errorMessage = msg;
          });
        } else {
          this.translate.get('signup.error_server').subscribe((msg: string) => {
            this.errorMessage = msg;
          });
        }


        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }
}
