import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FunctionDto {
  id: number;
  functionName: string;
}

@Injectable({ providedIn: 'root' })
export class FunctionService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/functions';

  constructor(private http: HttpClient) {}

  /** GET all functions */
  getAll(): Observable<FunctionDto[]> {
    return this.http.get<FunctionDto[]>(this.baseUrl);
  }

  /** GET one function by ID */
  getById(id: number): Observable<FunctionDto> {
    return this.http.get<FunctionDto>(`${this.baseUrl}/${id}`);
  }

  /** POST create a new function */
  create(payload: { functionName: string }): Observable<FunctionDto> {
    return this.http.post<FunctionDto>(this.baseUrl, payload);
  }
}
