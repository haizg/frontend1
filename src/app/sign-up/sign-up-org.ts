import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalService } from '../services/modal.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-sign-up-org',
  standalone: true,
  imports: [FormsModule, CommonModule],
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

  constructor(
    private router: Router,
    private http: HttpClient,
    private modalService: ModalService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  close() {
    this.modalService.closeSignupModal();
  }

  signed(form: any) {

    console.log("form valid?", form.valid);
    console.log("role value:", this.role);

    if (form.invalid) {
      this.errorMessage = "Veuillez remplir tous les champs obligatoires";
      return;
    }

    if (this.mdp !== this.confirmMdp) {
      this.errorMessage = "Les mots de passe ne correspondent pas";
      return;
    }

    if (
      this.role === 'ROLE_ORGANISATEUR' &&
      !this.nomOrganisation.trim()
    ) {
      this.errorMessage =
        "Le nom de l'organisation est obligatoire pour les organisateurs";
      return;
    }

    this.errorMessage = '';

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
       )

    .subscribe({

      next: (response: any) => {

             console.log('✅ Signup successful - Raw response:', response);

             let message = '';
             try {
               const jsonResponse = JSON.parse(response);
               message = jsonResponse.message || 'Inscription réussie!';
               console.log('✅ Parsed JSON:', jsonResponse);
             } catch (e) {
               message = response || 'Inscription réussie!';
               console.log('ℹ️ Response is text, not JSON:', response);
             }

             alert(
               'Inscription réussie ! Un email de vérification a été envoyé à ' +
               this.email +
               '. Veuillez vérifier votre boîte de réception avant de vous connecter.'
             );

             this.modalService.closeSignupModal();

             this.router.navigate(['/home']);
           },

           error: (err) => {

             console.error('❌ Signup error:', err);

             if (err.status === 200) {
               console.log('ℹ️ Status 200 but Angular thinks it\'s an error - treating as success');

               alert(
                 'Inscription réussie ! Un email de vérification a été envoyé à ' +
                 this.email +
                 '. Veuillez vérifier votre boîte de réception avant de vous connecter.'
               );

               this.modalService.closeSignupModal();
               this.router.navigate(['/home']);
               return;
             }

             if (err.status === 409) {
               this.errorMessage = "Cet email existe déjà.";
             } else if (err.status === 400) {
               this.errorMessage = "Données invalides.";
             } else {
               this.errorMessage = "Erreur serveur lors de l'inscription.";
             }
           }
         });
       }
     }
