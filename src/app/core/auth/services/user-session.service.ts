import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { decodeToken } from './token.utils';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  name?: string;
  [key: string]: any;
}

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

  getNameFromToken(): string {
    const token = localStorage.getItem('auth_token');
    if (!token) return '';
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.name ?? '';
    } catch (e) {
      console.error('Error decoding JWT', e);
      return '';
    }
  }
}
