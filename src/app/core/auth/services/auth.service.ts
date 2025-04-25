import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrlAuth = 'http://localhost:8080/api/auth';
  private apiUrlRecovery = 'http://localhost:8080/api/recovery';
  private apiUrlPassword = 'http://localhost:8080/api/password';

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

  changePassword(newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrlPassword}/change-password`, {
      newPassword,
    });
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
}
