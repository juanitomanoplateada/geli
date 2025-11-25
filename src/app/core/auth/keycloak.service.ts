import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthKeycloakService {
  constructor(private keycloak: KeycloakService) {}

  login() {
    return this.keycloak.login();
  }

  logout() {
    return this.keycloak.logout();
  }

  isAuthenticated(): Promise<boolean> {
    return this.keycloak.isLoggedIn();
  }

  getUserProfile() {
    return this.keycloak.loadUserProfile();
  }

  getRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  getToken(): Promise<string> {
    return this.keycloak.getToken();
  }
}
