import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.prod';
import { UserRecordResponse } from '../../dto/user/record-user-response.dto';
import { CreateUserRequest } from '../../dto/user/create-user-request.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/users`;

  constructor(private http: HttpClient) {}

  createUser(userData: CreateUserRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}`, userData);
  }

  getUsers(): Observable<UserRecordResponse[]> {
    return this.http.get<UserRecordResponse[]>(this.baseUrl).pipe(
      map((users) => {
        if (!Array.isArray(users)) {
          console.warn('⚠️ Usuarios recibidos no son un arreglo:', users);
          return [];
        }

        return users.map((user) => ({
          ...user,
          firstName: user.firstName?.trim() || '',
          lastName: user.lastName?.trim() || '',
          creationDate: this.formatDate(user.creationDate),
          modificationStatusDate: this.formatDate(user.modificationStatusDate),
        }));
      })
    );
  }

  filterUsers(payload: any, page: number, size: number): Observable<any> {
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

  updateUser(
    userId: number,
    data: { isActive: boolean; positionId?: number; positionName?: string }
  ): Observable<UserRecordResponse> {
    return this.http
      .put<UserRecordResponse>(`${this.baseUrl}/${userId}`, data)
      .pipe(
        map((user) => ({
          ...user,
          creationDate: this.formatDate(user.creationDate),
          modificationStatusDate: this.formatDate(user.modificationStatusDate),
        }))
      );
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/exists-by-email`, {
      params: { email: email.toUpperCase() },
    });
  }

  toggleUserStatus(userId: number, isActive: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}`, { isActive });
  }

  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-'; // Si la fecha es vacía o nula, devolver "-"

    const parts = dateString.split('-');
    if (parts.length !== 3) {
      console.error(`Fecha malformada: ${dateString}`);
      return '-';
    }

    const [year, month, day] = parts;

    if (isNaN(+year) || isNaN(+month) || isNaN(+day)) {
      console.error(`Fecha con valores inválidos: ${dateString}`);
      return '-';
    }

    // Normaliza a formato YYYY-MM-DD (por si viene como YYYY-M-D, etc.)
    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(
      2,
      '0'
    )}`;
  }

  getUserByEmail(email: string): Observable<UserRecordResponse> {
    return this.http
      .get<UserRecordResponse>(`${this.baseUrl}/by-email`, {
        params: { email: email.toUpperCase() },
      })
      .pipe(
        map((user) => ({
          ...user,
          creationDate: this.formatDate(user.creationDate),
          modificationStatusDate: this.formatDate(user.modificationStatusDate),
        }))
      );
  }

  getUserById(userId: number): Observable<UserRecordResponse> {
    return this.http.get<UserRecordResponse>(`${this.baseUrl}/${userId}`).pipe(
      map((user) => ({
        ...user,
        creationDate: this.formatDate(user.creationDate),
        modificationStatusDate: this.formatDate(user.modificationStatusDate),
      }))
    );
  }

  updateAuthorizedEquipments(
    userId: number,
    equipmentIds: number[]
  ): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/${userId}/authorized-equipments`,
      {
        equipmentIds: equipmentIds,
      }
    );
  }
}
