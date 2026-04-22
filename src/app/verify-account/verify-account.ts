import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';


@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-account.html',
  styleUrls: ['./verify-account.css']
})
export class VerifyAccount implements OnInit {
  isVerifying: boolean = true;
  isVerified: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private apiService : ApiService,
    public router: Router,
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
    this.apiService.verifyToken(token).subscribe({
        next: (response: any) => {
          this.isVerifying = false;
          this.isVerified = true;
          this.successMessage = response.message || 'Compte vérifié avec succès!';
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 3000);
        },

        error: (error : any) => {
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
