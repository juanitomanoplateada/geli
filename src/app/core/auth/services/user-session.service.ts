import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { decodeToken } from './token.utils';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UserSessionService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('auth_token');
  }

  getUsername(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('username');
  }

  getRoles(): string[] {
    if (!this.isBrowser()) return [];
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = decodeToken(token);
    const isValid = decoded?.exp * 1000 > Date.now();

    if (!isValid) {
      this.logout();
      return false;
    }

    return true;
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.clear();
      this.router.navigate(['/auth/login']);
    }
  }
}
