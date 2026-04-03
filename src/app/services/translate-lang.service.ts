import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SupportedLanguage = 'fr' | 'en';

@Injectable({ providedIn: 'root' })
export class TranslateLangService {
  private currentLangSubject = new BehaviorSubject<SupportedLanguage>('fr');
  currentLang$: Observable<SupportedLanguage> = this.currentLangSubject.asObservable();

  constructor(
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Set supported languages
    this.translateService.addLangs(['fr', 'en']);

    // Get saved language from localStorage (browser only)
    let savedLang: SupportedLanguage = 'fr';
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('lang') as SupportedLanguage;
      if (stored && (stored === 'fr' || stored === 'en')) {
        savedLang = stored;
      }
    }

    // Set default and current language
    this.translateService.setDefaultLang('fr');
    this.translateService.use(savedLang);
    this.currentLangSubject.next(savedLang);
  }

  switchTo(lang: SupportedLanguage): void {
    if (lang !== 'fr' && lang !== 'en') return;

    this.translateService.use(lang);
    this.currentLangSubject.next(lang);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
  }

  getCurrentLang(): SupportedLanguage {
    return this.currentLangSubject.value;
  }

  // Helper method to get translation (replaces old lang.get())
  get(key: string, params?: object): string {
    return this.translateService.instant(key, params);
  }
}
