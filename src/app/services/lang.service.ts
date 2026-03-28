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
    'events.allevents': 'Tous les événements',
    'events.upcomingevents': 'Événements à venir',
    'events.participate': 'Participer',
    'events.full': 'COMPLET',
    'events.allcategories': 'Toutes les catégories',
    'events.noevents': 'Aucun événement disponible.',
    'home.organisateur':'Créez, gérez et promouvez vos événements culturels en toute simplicité. Votre plateforme pour organiser des expériences inoubliables.',
    'home.participant':'Découvrez et participez à des événements culturels passionnants. Rejoignez une communauté engagée et vivez des expériences uniques.',
    'home.visiteur':'Organisez, gérez et participez à vos événements en toute simplicité. Une plateforme moderne pour créer des expériences inoubliables.',
    'joincta.join':'Rejoignez Véra',
    'joincta.faitespartie':'Faites partie d une communauté engagée.',
    'joincta.joinsubtitle':'Découvrez, organisez et partagez des événements culturels en toute simplicité. L adhésion est entièrement gratuite.'
  },
  en: {
    'navbar.home': 'Home',
    'navbar.events': 'Events',
    'navbar.about':'About Us',
    'navbar.contact':'Contact',
    'navbar.login': 'Log In',
    'navbar.signup': 'Sign Up',
    'navbar.logout': 'Log Out',
    'events.allevents': 'See all events',
    'events.upcomingevents': 'Upcoming Events',
    'events.participate': 'Participate',
    'events.full': 'FULL',
    'events.allcategories': 'All categories',
    'events.noevents': 'No events available.',
    'home.organisateur':'Create, manage, and promote your cultural events with ease. Your platform for organizing unforgettable experiences.',
    'home.participant':'Discover and participate in exciting cultural events. Join an engaged community and enjoy unique experiences.',
    'home.visiteur':'Organize, manage, and participate in your events with ease. A modern platform to create unforgettable experiences.',
    'joincta.join':'Join Véra',
    'joincta.faitespartie':'Be part of an engaged community.',
    'joincta.joinsubtitle':'Discover, organize, and share cultural events with ease. Membership is completely free.'
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
