import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BrandDto {
  id: number;
  brandName: string;
}

@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/brands';

  constructor(private http: HttpClient) {}

  /** GET all brands */
  getAll(): Observable<BrandDto[]> {
    return this.http.get<BrandDto[]>(this.baseUrl);
  }

  /** GET one brand by ID */
  getById(id: number): Observable<BrandDto> {
    return this.http.get<BrandDto>(`${this.baseUrl}/${id}`);
  }

  /** POST create a new brand */
  create(payload: { brandName: string }): Observable<BrandDto> {
    return this.http.post<BrandDto>(this.baseUrl, payload);
  }
}
