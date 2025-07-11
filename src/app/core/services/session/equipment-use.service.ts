import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { EquipmentAvailabilityStatusDto } from '../../dto/session/equipment-availability-status.dto';
import { EquipmentStartUseRequest } from '../../dto/session/start-session-request.dto';
import { EquipmentEndUseRequest } from '../../dto/session/end-session-request.dto';
import { EquipmentUseResponse } from '../../dto/session/session-response.dto';

@Injectable({ providedIn: 'root' })
export class EquipmentUseService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/equipment-use`;

  constructor(private http: HttpClient) {}

  startEquipmentUse(
    payload: EquipmentStartUseRequest
  ): Observable<EquipmentUseResponse> {
    return this.http.post<EquipmentUseResponse>(
      `${this.baseUrl}/start`,
      payload
    );
  }

  endEquipmentUse(
    id: number,
    payload: EquipmentEndUseRequest
  ): Observable<EquipmentUseResponse> {
    return this.http.put<EquipmentUseResponse>(
      `${this.baseUrl}/${id}/end`,
      payload
    );
  }

  getAllEquipmentUses(): Observable<EquipmentUseResponse[]> {
    return this.http.get<EquipmentUseResponse[]>(this.baseUrl).pipe(
      map((res) => res ?? []), // Si res es null, retorna []
      catchError((err) => {
        console.error('Error al obtener equipment uses:', err);
        return of([]); // Retorna array vacío en caso de error
      })
    );
  }

  getEquipmentUseById(id: number): Observable<EquipmentUseResponse> {
    return this.http.get<EquipmentUseResponse>(`${this.baseUrl}/${id}`);
  }

  filter(payload: any, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .post<any>(`${this.baseUrl}/filter`, payload, { params })
      .pipe(
        map((res) => (res?.content ? res : { content: [], totalPages: 0 })),
        catchError((error) => {
          console.error('Error en la consulta de sesiones:', error);
          return of({ content: [], totalPages: 0 });
        })
      );
  }

  getEquipmentAvailability(
    equipmentId: number
  ): Observable<EquipmentAvailabilityStatusDto> {
    const params = new HttpParams().set('equipmentId', equipmentId.toString());

    return this.http
      .get<EquipmentAvailabilityStatusDto>(`${this.baseUrl}/availability`, {
        params,
      })
      .pipe(
        map(
          (res) =>
            res ?? {
              status: 'AVAILABLE', // valor por defecto
              message: 'Sin información de disponibilidad.',
            }
        ),
        catchError((error) => {
          console.error('Error al consultar disponibilidad del equipo:', error);
          return of({
            status: 'AVAILABLE', // valor por defecto en caso de error
            message: 'Error al verificar disponibilidad del equipo.',
          } as EquipmentAvailabilityStatusDto);
        })
      );
  }
}
