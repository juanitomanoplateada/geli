import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EquipmentUseRequest {
  isInUse: boolean;
  isVerified: boolean;
  isAvailable: boolean;
  equipmentId: number;
  userId: number;
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
  };
  usedFunctions: {
    id: number;
    functionName: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class EquipmentUseService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/equipment-use';

  constructor(private http: HttpClient) {}

  startEquipmentUse(
    payload: EquipmentUseRequest
  ): Observable<EquipmentUseResponse> {
    return this.http.post<EquipmentUseResponse>(
      `${this.baseUrl}/start`,
      payload
    );
  }

  endEquipmentUse(id: number): Observable<EquipmentUseResponse> {
    return this.http.put<EquipmentUseResponse>(`${this.baseUrl}/${id}/end`, {});
  }

  getAllEquipmentUses(): Observable<EquipmentUseResponse[]> {
    return this.http.get<EquipmentUseResponse[]>(this.baseUrl);
  }

  getEquipmentUseById(id: number): Observable<EquipmentUseResponse> {
    return this.http.get<EquipmentUseResponse>(`${this.baseUrl}/${id}`);
  }
}
