import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

export interface LocationDto {
  id: number;
  locationName: string;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/locations`;

  constructor(private http: HttpClient) {}

  /** GET all locations */
  getAll(): Observable<LocationDto[]> {
    return this.http.get<LocationDto[]>(this.baseUrl);
  }

  /** GET one location by ID */
  getById(id: number): Observable<LocationDto> {
    return this.http.get<LocationDto>(`${this.baseUrl}/${id}`);
  }

  /** POST create a new location */
  create(payload: { locationName: string }): Observable<LocationDto> {
    return this.http.post<LocationDto>(this.baseUrl, payload);
  }
}
