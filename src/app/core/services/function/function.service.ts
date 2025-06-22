import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { FunctionDto } from '../../dto/function/function-response.dto';

@Injectable({ providedIn: 'root' })
export class FunctionService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/functions`;

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

  /** GET check if a position name already exists */
  existsByName(functionName: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/exists`, {
      params: { functionName },
    });
  }

  /** PUT update a position by ID */
  update(id: number, dto: FunctionDto): Observable<FunctionDto> {
    return this.http.put<FunctionDto>(`${this.baseUrl}/${id}`, dto);
  }
}
