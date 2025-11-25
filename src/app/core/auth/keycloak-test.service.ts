// keycloak-test.service.ts
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { keycloakConfig } from './keycloak.config';

@Injectable({ providedIn: 'root' })
export class KeycloakTestService {
  constructor(private keycloak: KeycloakService) {}

  async initKeycloak(): Promise<boolean> {
    try {
      const initialized = await this.keycloak.init(keycloakConfig);
      console.log('Keycloak inicializado:', initialized);
      console.log('Token:', this.keycloak.getToken());
      console.log('Roles:', this.keycloak.getUserRoles());
      return initialized;
    } catch (err) {
      console.error('Error inicializando Keycloak:', err);
      return false;
    }
  }
}
