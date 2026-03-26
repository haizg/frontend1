import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LangService {
  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const saved = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('lang') || 'fr'
      : 'fr';
    this.translate.setDefaultLang('fr');
    this.translate.use(saved);
  }

  switchTo(lang: 'fr' | 'en') {
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
  }

  getCurrentLang(): string {
    return this.translate.currentLang || 'fr';
  }
}
