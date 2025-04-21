import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl =
    'http://localhost:9090/realms/geli-dev/protocol/openid-connect/token';
  private clientId = 'geli-backend';
  private clientSecret = 'Wpo1fuXEWVujnNBuB6PCTrQpEmQemPy8';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('client_id', this.clientId)
      .set('grant_type', 'password')
      .set('username', username)
      .set('password', password)
      .set('client_secret', this.clientSecret);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post(this.authUrl, body.toString(), { headers });
  }
}
