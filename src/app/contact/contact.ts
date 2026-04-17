import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../shared/footer/footer';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, RouterModule, Navbar, Footer, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  submitted = false;
  sending = false;
  errorMessage = '';
  showSuccessMessage = false;

  form = {
    prenom: '',
    nom: '',
    email: '',
    sujet: '',
    message: ''
  };

  faqs = [
    {
      q: 'Comment devenir organisateur ?',
      a: 'Inscrivez-vous en choisissant le rôle "Organisateur". Votre compte sera vérifié par notre équipe sous 24-48h.',
      open: false
    },
    {
      q: 'La participation aux événements est-elle payante ?',
      a: 'Non, s\'inscrire à un événement sur Invitini est totalement gratuit pour les participants.',
      open: false
    },
    {
      q: 'Comment confirmer ma participation ?',
      a: 'Après votre inscription, vous recevrez un email avec un lien de confirmation. Cliquez dessus pour valider votre place.',
      open: false
    },
    {
      q: 'Mon événement n\'est pas encore visible, pourquoi ?',
      a: 'Chaque événement est vérifié par notre équipe avant publication. Ce processus prend généralement moins de 24h.',
      open: false
    }
  ];

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.sending = true;
    this.errorMessage = '';

    this.http.post('http://localhost:8081/api/contact', this.form, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.sending = false;
          this.showSuccessMessage = true;
          this.submitted = true;


        },
        error: () => {
          this.sending = false;
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer ou nous écrire directement.';
        }
      });
  }

}
