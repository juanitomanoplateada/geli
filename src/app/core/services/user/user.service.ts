import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.prod';
import { UserRecordResponse } from '../../dto/user/record-user-response.dto';
import { CreateUserRequestDto } from '../../dto/user/create-user-request.dto';
import { UserCreationDTO } from '../../dto/user/user-creation.dto';
import { UserResponseDTO } from '../../dto/user/user-response.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/users`;

  constructor(private http: HttpClient) {}

  createUser(userData: UserCreationDTO): Observable<UserResponseDTO> {
    return this.http
      .post<UserResponseDTO>(this.baseUrl, userData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.status === 400) {
      errorMessage = 'Invalid request. The user could not be created.';
    } else if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getUsers(): Observable<UserRecordResponse[]> {
    return this.http.get<UserRecordResponse[]>(this.baseUrl).pipe(
      map((users) => {
        if (!Array.isArray(users)) {
          console.warn('⚠️ Usuarios recibidos no son un arreglo:', users);
          return [];
        }

        return users.map((user) => this.formatUserDates(user));
      })
    );
  }

  getUserById(userId: number): Observable<UserRecordResponse> {
    return this.http
      .get<UserRecordResponse>(`${this.baseUrl}/${userId}`)
      .pipe(map((user) => this.formatUserDates(user)));
  }

  updateUser(
    userId: number,
    data: { isActive: boolean; positionId?: number; positionName?: string }
  ): Observable<UserRecordResponse> {
    return this.http
      .put<UserRecordResponse>(`${this.baseUrl}/${userId}`, data)
      .pipe(map((user) => this.formatUserDates(user)));
  }

  // Métodos de búsqueda/filtrado
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

  getUserByEmail(email: string): Observable<UserRecordResponse> {
    return this.http
      .get<UserRecordResponse>(`${this.baseUrl}/by-email`, {
        params: { email: email.toUpperCase() },
      })
      .pipe(map((user) => this.formatUserDates(user)));
  }

  // Métodos de verificación
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/exists-by-email`, {
      params: { email: email.toUpperCase() },
    });
  }

  // Métodos de verificación
  checkIdentificationExists(identification: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/exists-by-identification`, {
      params: { identification: identification.toUpperCase() },
    });
  }

  // Métodos de estado
  toggleUserStatus(userId: number, isActive: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}`, { isActive });
  }

  // Métodos de equipamiento autorizado
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

  // Métodos privados de ayuda
  private formatUserDates(user: UserRecordResponse): UserRecordResponse {
    return {
      ...user,
      firstName: user.firstName?.trim() || '',
      lastName: user.lastName?.trim() || '',
      creationDate: this.formatDate(user.creationDate),
      modificationStatusDate: this.formatDate(user.modificationStatusDate),
    };
  }

  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';

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

    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(
      2,
      '0'
    )}`;
  }
}
