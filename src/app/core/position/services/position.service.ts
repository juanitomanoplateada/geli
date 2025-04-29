import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PositionDto {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class PositionService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/positions';

  constructor(private http: HttpClient) {}

  /** GET all positions */
  getAll(): Observable<PositionDto[]> {
    return this.http.get<PositionDto[]>(this.baseUrl);
  }

  /** POST create a new position */
  create(payload: { name: string }): Observable<PositionDto> {
    return this.http.post<PositionDto>(this.baseUrl, payload);
  }
}
