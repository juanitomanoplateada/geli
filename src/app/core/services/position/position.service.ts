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

  /** GET check if a position name already exists */
  existsByName(name: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/exists`, {
      params: { name },
    });
  }

  /** PUT update a position by ID */
  update(id: number, dto: PositionDto): Observable<PositionDto> {
    return this.http.put<PositionDto>(`${this.baseUrl}/${id}`, dto);
  }
}
