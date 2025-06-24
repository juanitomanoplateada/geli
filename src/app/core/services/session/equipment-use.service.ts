import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

export interface EquipmentStartUseRequest {
  equipmentId: number;
  userId: number;
}

export interface EquipmentEndUseRequest {
  isVerified: boolean;
  isAvailable: boolean;
  samplesNumber: number;
  usedFunctions: number[];
  observations: string;
}

export interface EquipmentUseResponse {
  id: number;
  isInUse: boolean;
  isVerified: boolean;
  isAvailable: boolean;
  samplesNumber: number;
  observations: string;
  useDate: string;
  startUseTime: string;
  endUseTime: string | null;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    identification: string;
  };
  equipment: {
    id: number;
    equipmentName: string;
    inventoryNumber: string;
    availability: boolean;
    equipmentObservations: string | null;
    laboratory: {
      id: number;
      laboratoryName: string;
      laboratoryDescription: string;
      location: {
        id: number;
        locationName: string;
      };
      laboratoryAvailability: boolean;
      laboratoryObservations: string;
    };
  };
  usedFunctions: {
    id: number;
    functionName: string;
  }[];
}

export interface EquipmentUseFilterRequest {
  isInUse?: boolean | null;
  isVerified?: boolean | null;
  isAvailable?: boolean | null;
  equipmentId?: number;
  userId?: number;
  laboratoryId?: number;
  samplesNumberFrom?: number;
  samplesNumberTo?: number;
  usedFunctionsIds?: number[];
  useDateFrom?: string;
  useDateTo?: string;
  startUseTimeFrom?: string;
  endUseTimeTo?: string;
}

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
        map((res) =>
          res && res.content ? res : { content: [], totalPages: 0 }
        )
      );
  }
}
