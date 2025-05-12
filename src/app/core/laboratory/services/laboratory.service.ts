import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Laboratory } from '../models/laboratory.model';
import { environment } from '../../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class LaboratoryService {
  private apiUrl = `${environment.apiBaseUrl}/v1/laboratories`;

  constructor(private http: HttpClient) {}

  /** GET: Obtener todos los laboratorios */
  getLaboratories(): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(this.apiUrl);
  }

  /** POST: Filtrar laboratorios */
  filterLaboratories(filters: any): Observable<Laboratory[]> {
    return this.http.post<Laboratory[]>(`${this.apiUrl}/filter`, filters);
  }

  /** POST: Crear laboratorio */
  createLaboratory(lab: Laboratory): Observable<Laboratory> {
    return this.http.post<Laboratory>(this.apiUrl, lab);
  }

  /** GET: Obtener laboratorio por ID */
  getLaboratoryById(id: number): Observable<Laboratory> {
    return this.http.get<Laboratory>(`${this.apiUrl}/${id}`);
  }

  /** PUT: Actualizar laboratorio por ID */
  updateLaboratory(id: number, lab: Laboratory): Observable<Laboratory> {
    return this.http.put<Laboratory>(`${this.apiUrl}/${id}`, lab);
  }

  /** GET: Verificar si un laboratorio existe por nombre */
  existsByName(name: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists-by-name`, {
      params: { laboratoryName: name },
    });
  }
}
