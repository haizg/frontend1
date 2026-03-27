import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

const fr = {
  "navbar.home": "Accueil",
  "navbar.events": "Événements",
  "navbar.faqs": "FAQs",
  "navbar.about": "À propos",
  "navbar.contact": "Contact",
  "navbar.login": "Se connecter",
  "navbar.signup": "S'inscrire",
  "navbar.logout": "Se déconnecter",
  "home.tagline.guest": "Organisez, gérez et participez à vos événements en toute simplicité.",
  "home.tagline.guest2": "Une plateforme moderne pour créer des expériences inoubliables.",
  "events.title": "Tous les événements",
  "events.noevents": "Aucun événement disponible.",
  "events.participate": "Participer",
  "events.full": "COMPLET",
  "events.allcategories": "Toutes les catégories",
  "footer.rights": "Tous droits réservés"
};

const en = {
  "navbar.home": "Home",
  "navbar.events": "Events",
  "navbar.faqs": "FAQs",
  "navbar.about": "About Us",
  "navbar.contact": "Contact",
  "navbar.login": "Log In",
  "navbar.signup": "Sign Up",
  "navbar.logout": "Log Out",
  "home.tagline.guest": "Organize, manage and participate in your events with ease.",
  "home.tagline.guest2": "A modern platform to create unforgettable experiences.",
  "events.title": "All Events",
  "events.noevents": "No events available.",
  "events.participate": "Participate",
  "events.full": "FULL",
  "events.allcategories": "All categories",
  "footer.rights": "All rights reserved"
};

export class InlineTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of(lang === 'en' ? en : fr);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'fr',
        loader: {
          provide: TranslateLoader,
          useClass: InlineTranslateLoader
        }
      })
    )
  ]
};
