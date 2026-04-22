import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../shared/footer/footer';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLangService } from '../services/translate-lang.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, RouterModule, Navbar, Footer, FormsModule, TranslateModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  submitted = false;
  sending = false;
  errorMessage = '';
  showSuccessMessage = false;

  form = { prenom: '', nom: '', email: '', sujet: '', message: '' };

faqs = [
  {q: 'contact.faq1q', a: 'contact.faq1a', open: false },
  {q: 'contact.faq2q', a: 'contact.faq2a', open: false },
  {q: 'contact.faq3q', a: 'contact.faq3a', open: false },
  {q: 'contact.faq4q', a: 'contact.faq4a', open: false }
      ];

  constructor(private apiService: ApiService,
    private translateLang: TranslateLangService) {}

  onSubmit() {
    this.sending = true;
    this.errorMessage = '';
    this.apiService.sendContactForm(this.form).subscribe({
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
