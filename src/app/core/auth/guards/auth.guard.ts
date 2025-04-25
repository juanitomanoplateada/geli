import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const accessToken = localStorage.getItem('auth_token');
    const tempToken = localStorage.getItem('temp_token');

    const isRecoveryFlow =
      state.url === '/auth/confirm-code' ||
      state.url === '/auth/change-password';

    if (accessToken || (isRecoveryFlow && tempToken)) {
      return true;
    }

    this.router.navigate(['/auth/login']);
    return false;
  }
}
