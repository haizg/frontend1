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
    'joincta.joinsubtitle':'Découvrez, organisez et partagez des événements culturels en toute simplicité. L adhésion est entièrement gratuite.',
    'login.mdp':'Mot de passe:',
    'login.forgotpsw':'Mot de passe oublié ?',
    'signup.nom':'Nom',
    'signup.prenom':'Prenom',
    'signup.confirmmdp':'Confirmer le mot de passe',
    'signup.org':'Organisateur',
    'signup.nomorg':'Nom de l organisation',
    'profile.myevents': 'Mes événements',
    'profile.myparticipations': 'Mes participations',
    'profile.editprofile': 'Modifier le profil',
    'profile.changepassword': 'Changer le mot de passe',
    'profile.createdEvents': 'Mes événements créés',
    'profile.participatedEvents': 'Événements auxquels j\'ai participé',
    'profile.nocreated': 'Vous n\'avez pas encore créé d\'événements.',
    'profile.noparticipated': 'Vous n\'avez participé à aucun événement.',
    'profile.organisateur': 'Organisateur',
    'profile.participant': 'Participant',
    'profile.prenom': 'Prénom',
    'profile.nom': 'Nom',
    'profile.email': 'Email',
    'profile.organisation': 'Nom de l\'organisation (optionnel)',
    'profile.save': 'Enregistrer',
    'profile.oldpassword': 'Ancien mot de passe',
    'profile.newpassword': 'Nouveau mot de passe',
    'profile.confirmpassword': 'Confirmer le mot de passe',
    'profile.modify': 'Modifier',
    'profile.loginrequired': 'Veuillez vous connecter pour voir votre profil.',
    'events.summary': 'événement',
    'events.summaryplural': 'événements',
    'events.total': 'au total',
    'events.complet': 'complet',
    'events.complets': 'complets',
    'events.ttcategories':'Tous les catégories',
    'events.modifier':'Modifier',
    'events.supprimer':'Supprimer',
    'eventdetail.date': 'Date',
    'eventdetail.heure': 'Heure',
    'eventdetail.lieu': 'Lieu',
    'eventdetail.capacity': 'Capacité',
    'eventdetail.personnes': 'personnes',
    'eventdetail.about': 'À propos de cet événement',
    'eventdetail.modifier': 'Modifier',
    'eventdetail.supprimer': 'Supprimer',
    'eventdetail.stats': 'Statistiques',
    'eventdetail.confirmed': 'Inscriptions confirmées',
    'eventdetail.expected': 'Personnes attendues',
    'eventdetail.totalcapacity': 'Capacité totale',
    'eventdetail.fillrate': 'Taux de remplissage',
    'eventdetail.filling': 'Remplissage',
    'eventdetail.participants': 'Liste des participants',
    'eventdetail.noparticipants': 'Aucun participant pour le moment.',
    'eventdetail.email': 'Email',
    'eventdetail.people': 'Personnes',
    'eventdetail.status': 'Statut',
    'eventdetail.confirmed_badge': 'Confirmé',
    'eventdetail.pending_badge': 'En attente',
    'eventdetail.participate': 'Participer à cet événement',
    'eventdetail.loading': 'Chargement...',
  },
  en: {
    'navbar.home': 'Home',
    'navbar.events': 'Events',
    'navbar.about':'About Us',
    'navbar.contact':'Contact',
    'navbar.login': 'Log In',
    'navbar.signup': 'Sign Up',
    'navbar.logout': 'Log Out',
    'events.allevents': 'All events',
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
    'joincta.joinsubtitle':'Discover, organize, and share cultural events with ease. Membership is completely free.',
    'login.mdp':'Password:',
    'login.forgotpsw':'Forgot password ?',
    'signup.nom':'Name',
    'signup.prenom':'Last name',
    'signup.confirmmdp':'Confirm password',
    'signup.org':'Organizer',
    'signup.nomorg':'Organization name',
    'profile.myevents': 'My Events',
    'profile.myparticipations': 'My Participations',
    'profile.editprofile': 'Edit Profile',
    'profile.changepassword': 'Change Password',
    'profile.createdEvents': 'My Created Events',
    'profile.participatedEvents': 'Events I Participated In',
    'profile.nocreated': 'You haven\'t created any events yet.',
    'profile.noparticipated': 'You haven\'t participated in any events.',
    'profile.organisateur': 'Organizer',
    'profile.participant': 'Participant',
    'profile.prenom': 'First Name',
    'profile.nom': 'Last Name',
    'profile.email': 'Email',
    'profile.organisation': 'Organization Name (optional)',
    'profile.save': 'Save',
    'profile.oldpassword': 'Old Password',
    'profile.newpassword': 'New Password',
    'profile.confirmpassword': 'Confirm Password',
    'profile.modify': 'Update',
    'profile.loginrequired': 'Please log in to view your profile.',
    'events.summary': 'event',
    'events.summaryplural': 'events',
    'events.total': 'in total',
    'events.complet': 'full',
    'events.complets': 'full',
    'events.ttcategories':'All categories',
    'events.modifier':'Modify',
    'events.supprimer':'Delete',
    'eventdetail.date': 'Date',
    'eventdetail.heure': 'Time',
    'eventdetail.lieu': 'Location',
    'eventdetail.capacity': 'Capacity',
    'eventdetail.personnes': 'people',
    'eventdetail.about': 'About this event',
    'eventdetail.modifier': 'Edit',
    'eventdetail.supprimer': 'Delete',
    'eventdetail.stats': 'Statistics',
    'eventdetail.confirmed': 'Confirmed registrations',
    'eventdetail.expected': 'Expected attendees',
    'eventdetail.totalcapacity': 'Total capacity',
    'eventdetail.fillrate': 'Fill rate',
    'eventdetail.filling': 'Filling',
    'eventdetail.participants': 'Participants list',
    'eventdetail.noparticipants': 'No participants yet.',
    'eventdetail.email': 'Email',
    'eventdetail.people': 'People',
    'eventdetail.status': 'Status',
    'eventdetail.confirmed_badge': 'Confirmed',
    'eventdetail.pending_badge': 'Pending',
    'eventdetail.participate': 'Participate in this event',
    'eventdetail.loading': 'Loading...'
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
