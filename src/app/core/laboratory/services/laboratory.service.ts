import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Laboratory } from '../models/laboratory.model';

@Injectable({ providedIn: 'root' })
export class LaboratoryService {
  private apiUrl = 'http://localhost:8080/api/v1/laboratories';

  constructor(private http: HttpClient) {}

  getLaboratories(): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(this.apiUrl);
  }

  filterLaboratories(filters: any): Observable<Laboratory[]> {
    return this.http.post<Laboratory[]>(`${this.apiUrl}/filter`, filters);
  }
}
