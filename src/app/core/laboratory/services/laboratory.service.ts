import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LaboratoryService {
  private apiUrl = 'http://localhost:8080/api/v1/laboratories'; // Ajusta la URL de tu backend

  constructor(private http: HttpClient) {}

  getLaboratories(token: string): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(this.apiUrl, { headers });
  }
}
