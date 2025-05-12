import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EquipmentDto } from '../models/equipment-response.dto';
import {
  EquipmentCreateUpdateDto,
  EquipmentFilterDto,
} from '../models/equipment-request.dto';
import { EquipmentUpdateDto } from '../models/equipment-update.dto';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/equipments`;

  constructor(private http: HttpClient) {}

  /** GET all equipments */
  getAll(): Observable<EquipmentDto[]> {
    return this.http.get<EquipmentDto[]>(this.baseUrl);
  }

  /** GET one equipment by ID */
  getById(id: number): Observable<EquipmentDto> {
    return this.http.get<EquipmentDto>(`${this.baseUrl}/${id}`);
  }

  /** POST create new equipment */
  create(payload: EquipmentCreateUpdateDto): Observable<EquipmentDto> {
    return this.http.post<EquipmentDto>(this.baseUrl, payload);
  }

  /** PUT update equipment by ID */
  update(id: number, payload: EquipmentUpdateDto): Observable<EquipmentUpdateDto> {
    return this.http.put<EquipmentUpdateDto>(`${this.baseUrl}/${id}`, payload);
  }

  /** POST filter equipments */
  filter(payload: EquipmentFilterDto): Observable<EquipmentDto[]> {
    return this.http.post<EquipmentDto[]>(`${this.baseUrl}/filter`, payload);
  }

  /** GET check if equipment exists by name */
  existsByName(name: string): Observable<boolean> {
    const encodedName = encodeURIComponent(name);
    const params = new HttpParams().set('equipmentName', encodedName);
    return this.http.get<boolean>(`${this.baseUrl}/exists-by-name`, { params });
  }

  /** GET check if equipment exists by inventory number */
  existsByInventoryNumber(inventoryNumber: string): Observable<boolean> {
    const encodedInv = encodeURIComponent(inventoryNumber);
    const params = new HttpParams().set('inventoryNumber', encodedInv);
    return this.http.get<boolean>(
      `${this.baseUrl}/exists-by-inventory-number`,
      { params }
    );
  }
}
