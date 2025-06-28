import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { EquipmentUpdateDto } from '../../dto/equipments-patterns/equipment-update.dto';
import { environment } from '../../../../environments/environment.prod';
import {
  EquipmentCreateUpdateDto,
  EquipmentFilterDto,
} from '../../dto/equipments-patterns/equipment-request.dto';
import { EquipmentDto } from '../../dto/equipments-patterns/equipment-response.dto';
import { EquipmentDTO } from '../../dto/equipments-patterns/equipment.dto';
import { EquipmentAvailabilityDto } from '../../dto/equipments-patterns/equipment-availability.dto';

interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/equipments`;

  constructor(private http: HttpClient) {}

  /** GET all equipments */
  getAll(): Observable<PagedResponse<EquipmentDto>> {
    return this.http.get<PagedResponse<EquipmentDto>>(this.baseUrl);
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
  update(
    id: number,
    payload: EquipmentUpdateDto
  ): Observable<EquipmentUpdateDto> {
    return this.http.put<EquipmentUpdateDto>(`${this.baseUrl}/${id}`, payload);
  }

  /** POST filter equipments */
  filterEquipments(payload: any, page: number, size: number): Observable<any> {
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

  existsByInventoryNumberUpdate(
    name: string,
    excludeId?: number
  ): Observable<boolean> {
    const params: any = { inventoryNumber: name };
    if (excludeId !== undefined) {
      params.excludeId = excludeId;
    }
    return this.http.get<boolean>(
      `${this.baseUrl}/exists-by-update-inventory-number`,
      {
        params,
      }
    );
  }

  getEquipmentsAuthorizeds(labId: number): Observable<EquipmentDTO[]> {
    return this.http
      .get<EquipmentDTO[]>(`${this.baseUrl}/authorized/by-lab/${labId}`)
      .pipe(
        map((equipments) => equipments ?? []), // Si la respuesta es null → []
        catchError(() => of([])) // Si hay error → []
      );
  }

  getEquipmentAvailability(
    equipmentId: number
  ): Observable<EquipmentAvailabilityDto> {
    return this.http
      .get<EquipmentAvailabilityDto>(
        `${this.baseUrl}/${equipmentId}/availability`
      )
      .pipe(
        map(
          (res) =>
            res ?? { active: false, message: 'Sin información disponible.' }
        ), // default si viene null
        catchError((err) => {
          console.error('Error al obtener disponibilidad del equipo:', err);
          // respuesta por defecto en caso de error
          return of({
            active: false,
            message: 'Error de conexión con el servidor.',
          });
        })
      );
  }
}
