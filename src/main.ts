import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { KeycloakService } from 'keycloak-angular';
import { keycloakConfig } from './app/core/auth/keycloak.config';
import { keycloakInterceptor } from './app/core/auth/keycloak.interceptor';

export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: keycloakConfig.config,
      initOptions: keycloakConfig.initOptions,
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer',
      loadUserProfileAtStartUp: true,
    });
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([keycloakInterceptor])),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
  ],
}).catch((err) => console.error(err));
