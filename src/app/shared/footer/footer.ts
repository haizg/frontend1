import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  currentYear = new Date().getFullYear();

  eventLinks = [
    { label: 'À venir', route: '/events/upcoming' },
    { label: 'Passés', route: '/events/past' },
    { label: 'Créer un événement', route: '/events/create' }
  ];

  helpLinks = [
    { label: 'FAQ', route: '/faq' },
    { label: 'Support', route: '/support' },
    { label: 'Guide utilisateur', route: '/guide' }
  ];

  aboutLinks = [
    { label: 'Équipe', route: '/about/team' },
    { label: 'Contact', route: '/contact' }
  ];

  supportEmail = 'support@vera.com';
}


