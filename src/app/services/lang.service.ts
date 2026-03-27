// src/app/services/lang.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

const translations: any = {
  fr: {
    'navbar.home': 'Accueil',
    'navbar.events': 'Événements',
    'navbar.about':'À propos',
    'navbar.contact':'Contact',
    'navbar.login': 'Se connecter',
    'navbar.signup': "S'inscrire",
    'navbar.logout': 'Se déconnecter',
    'events.title': 'Tous les événements',
    'events.participate': 'Participer',
    'events.full': 'COMPLET',
    'events.allcategories': 'Toutes les catégories',
    'events.noevents': 'Aucun événement disponible.'
  },
  en: {
    'navbar.home': 'Home',
    'navbar.events': 'Events',
    'navbar.about':'About Us',
    'navbar.contact':'Contact',
    'navbar.login': 'Log In',
    'navbar.signup': 'Sign Up',
    'navbar.logout': 'Log Out',
    'events.title': 'All Events',
    'events.participate': 'Participate',
    'events.full': 'FULL',
    'events.allcategories': 'All categories',
    'events.noevents': 'No events available.'
  }
};

@Injectable({ providedIn: 'root' })
export class LangService {
  private lang = new BehaviorSubject<string>('fr');
  lang$ = this.lang.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('lang') || 'fr';
      this.lang.next(saved);
    }
  }

  switchTo(lang: 'fr' | 'en') {
    this.lang.next(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
  }

  get(key: string): string {
    return translations[this.lang.value]?.[key] || key;
  }

  getCurrentLang(): string {
    return this.lang.value;
  }
}
