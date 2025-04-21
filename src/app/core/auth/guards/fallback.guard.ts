import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserSessionService } from '../services/user-session.service';

@Injectable({ providedIn: 'root' })
export class FallbackGuard implements CanActivate {
  constructor(private session: UserSessionService, private router: Router) {}

  canActivate(): boolean {
    if (this.session.isAuthenticated()) {
      this.router.navigate(['/dashboard/home']);
    } else {
      this.router.navigate(['/auth/login']);
    }
    return false;
  }
}
