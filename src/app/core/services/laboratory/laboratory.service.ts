import { LaboratoryResponseDto } from './../../dto/laboratory/laboratory-response.dto';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { PageResponse } from '../../dto/page/page-response.dto';

@Injectable({ providedIn: 'root' })
export class LaboratoryService {
  private apiUrl = `${environment.apiBaseUrl}/v1/laboratories`;

  constructor(private http: HttpClient) {}

  /** GET: Obtener todos los laboratorios */
  getLaboratories(): Observable<LaboratoryResponseDto[]> {
    return this.http.get<LaboratoryResponseDto[]>(this.apiUrl);
  }

  /** GET: Obtener todos los laboratorios */
  getLaboratoriesAuthorizeds(): Observable<LaboratoryResponseDto[]> {
    return this.http.get<LaboratoryResponseDto[]>(`${this.apiUrl}/authorized/by-user`);
  }

  /** POST: Filtrar laboratorios con paginación */
  filterLaboratories(
    filters: any,
    page: number,
    size: number
  ): Observable<PageResponse<LaboratoryResponseDto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.post<PageResponse<LaboratoryResponseDto>>(
      `${this.apiUrl}/filter`,
      filters,
      { params }
    );
  }

  /** POST: Crear laboratorio */
  createLaboratory(
    lab: LaboratoryResponseDto
  ): Observable<LaboratoryResponseDto> {
    return this.http.post<LaboratoryResponseDto>(this.apiUrl, lab);
  }

  /** GET: Obtener laboratorio por ID */
  getLaboratoryById(id: number): Observable<LaboratoryResponseDto> {
    return this.http.get<LaboratoryResponseDto>(`${this.apiUrl}/${id}`);
  }

  /** PUT: Actualizar laboratorio por ID */
  updateLaboratory(
    id: number,
    lab: LaboratoryResponseDto
  ): Observable<LaboratoryResponseDto> {
    return this.http.put<LaboratoryResponseDto>(`${this.apiUrl}/${id}`, lab);
  }

  /** GET: Verificar si un laboratorio existe por nombre */
  existsByName(name: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists-by-name`, {
      params: { laboratoryName: name },
    });
  }

  existsByNameUpdate(name: string, excludeId?: number): Observable<boolean> {
    const params: any = { laboratoryName: name };
    if (excludeId !== undefined) {
      params.excludeId = excludeId;
    }
    return this.http.get<boolean>(`${this.apiUrl}/exists-by-update-name`, {
      params,
    });
  }
}
