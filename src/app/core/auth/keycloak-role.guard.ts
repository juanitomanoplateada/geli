import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class KeycloakRoleGuard implements CanActivate {
  constructor(private keycloak: KeycloakService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const requiredRoles: string[] = route.data['roles'] || [];
    const userRoles: string[] = await this.keycloak.getUserRoles();

    const hasRole = requiredRoles.some((role: string) =>
      userRoles.includes(role)
    );

    if (!hasRole) {
      this.router.navigate(['/auth/unauthorized']);
      return false;
    }

    return true;
  }
}
