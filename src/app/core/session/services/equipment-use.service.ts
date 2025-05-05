import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private readonly baseUrl = 'http://localhost:8080/api/v1/equipment-use';

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
    return this.http.get<EquipmentUseResponse[]>(this.baseUrl);
  }

  getEquipmentUseById(id: number): Observable<EquipmentUseResponse> {
    return this.http.get<EquipmentUseResponse>(`${this.baseUrl}/${id}`);
  }

  filter(
    filters: EquipmentUseFilterRequest
  ): Observable<EquipmentUseResponse[]> {
    return this.http.post<EquipmentUseResponse[]>(
      `${this.baseUrl}/filter`,
      filters
    );
  }
}
