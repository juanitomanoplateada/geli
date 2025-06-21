import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { LocationDto } from '../../dto/location/location-response.dto';
import { Observable } from 'rxjs';

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

  /** GET check if a position name already exists */
  existsByName(locationName: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/exists`, {
      params: { locationName },
    });
  }

  /** PUT update a position by ID */
  update(id: number, dto: LocationDto): Observable<LocationDto> {
    return this.http.put<LocationDto>(`${this.baseUrl}/${id}`, dto);
  }
}
