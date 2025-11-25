import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { KeycloakService } from 'keycloak-angular';
import { keycloakConfig } from './core/auth/keycloak.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([])),
    // Keycloak se inyectará aquí después de inicializarlo en main.ts
    { provide: KeycloakService, useValue: new KeycloakService() },
  ],
};
