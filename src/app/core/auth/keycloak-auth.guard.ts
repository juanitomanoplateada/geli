import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class KeycloakAuthGuard implements CanActivate {
  constructor(private keycloak: KeycloakService) {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this.keycloak.isLoggedIn();
    if (!isLoggedIn) {
      await this.keycloak.login(); // redirige al login de Keycloak
      return false;
    }
    return true;
  }
}
