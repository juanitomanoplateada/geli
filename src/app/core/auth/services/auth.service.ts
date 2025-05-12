import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrlAuth = `${environment.apiBaseUrl}/auth`;
  private apiUrlRecovery = `${environment.apiBaseUrl}/recovery`;
  private apiUrlPassword = `${environment.apiBaseUrl}/password`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrlAuth}/login`, { username, password });
  }

  sendRecoveryCode(username: string): Observable<any> {
    return this.http.post(`${this.apiUrlRecovery}/send-code`, { username });
  }

  resendRecoveryCode(tempToken: string): Observable<any> {
    return this.http.post(`${this.apiUrlRecovery}/resend-code`, {
      tempToken,
    });
  }

  verifyRecoveryCode(tempToken: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrlRecovery}/verify-code`, {
      tempToken,
      code,
    });
  }

  validateCurrentPassword(currentPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrlPassword}/validate`, {
      currentPassword,
    });
  }

  changePassword(newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrlPassword}/change`, { newPassword });
  }

  resetPasswordWithToken(
    tempToken: string,
    newPassword: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrlPassword}/reset`, {
      tempToken,
      newPassword,
    });
  }

  getCurrentUserEmail(): string {
    // Ejemplo: si guardas el token JWT en localStorage
    const token = localStorage.getItem('auth_token')!;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email;
  }
}
