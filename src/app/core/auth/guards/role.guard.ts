import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserSessionService } from '../services/user-session.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private session: UserSessionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'] || [];
    const userRoles = this.session.getRoles();

    const hasRole = expectedRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      this.router.navigate(['/auth/unauthorized']);
      return false;
    }

    return true;
  }
}
