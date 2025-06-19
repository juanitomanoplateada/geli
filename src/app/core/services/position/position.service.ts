import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.prod';
import { PositionDto } from '../../dto/position/position-response.dto';
import { CreatePositionRequestDto } from '../../dto/position/position-create-request.dto';

@Injectable({ providedIn: 'root' })
export class PositionService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/positions`;

  constructor(private http: HttpClient) {}

  /** GET all positions */
  getAll(): Observable<PositionDto[]> {
    return this.http.get<PositionDto[]>(this.baseUrl).pipe(
      map((res) => (Array.isArray(res) ? res : [])),
      catchError(() => of([]))
    );
  }

  /** POST create a new position */
  create(payload: CreatePositionRequestDto): Observable<PositionDto> {
    return this.http.post<PositionDto>(this.baseUrl, payload);
  }
}
