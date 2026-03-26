import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-account.html',
  styleUrls: ['./verify-account.css']
})
export class VerifyAccount implements OnInit {

  // Component state
  isVerifying: boolean = true;
  isVerified: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {


    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (!token) {
        this.isVerifying = false;
        this.isVerified = false;
        this.errorMessage = 'Token de vérification manquant';
        return;
      }

      this.verifyToken(token);
    });
  }


  verifyToken(token: string) {
    this.isVerifying = true;

    console.log('🔄 Verifying token:', token);

    this.http.get(`http://localhost:8081/api/auth/verify-account?token=${token}`)
      .subscribe({
        next: (response: any) => {
          console.log('✅ Verification successful:', response);

          this.isVerifying = false;
          this.isVerified = true;
          this.successMessage = response.message || 'Compte vérifié avec succès!';

          setTimeout(() => {
            console.log('🔀 Redirecting to home...');
            this.router.navigate(['/api/home']);
          }, 3000);
        },

        error: (error) => {
          console.error('❌ Verification error:', error);

          this.isVerifying = false;
          this.isVerified = false;

          if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'Erreur lors de la vérification du compte';
          }
        }
      });
  }
}
