import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import {authInterceptor} from './auth.interceptor';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';


export function HttpLoaderFactory() {
  return new TranslateHttpLoader();
}


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    importProvidersFrom(
          TranslateModule.forRoot({
                  loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [] // 👈 IMPORTANT: no HttpClient anymore
                  }
                })
        )
  ]
};
