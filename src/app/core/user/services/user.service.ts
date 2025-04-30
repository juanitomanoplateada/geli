import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  identification: string;
  role: string;
  positionId: number;
}

export interface PositionResponse {
  id: number;
  name: string;
}

export interface UserRecordResponse {
  id: number;
  keycloakId: string;
  firstName: string;
  lastName: string;
  email: string;
  identification: string;
  enabledStatus: boolean;
  role: string;
  modificationStatusDate: string;
  creationDate: string;
  position?: PositionResponse;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/users';

  constructor(private http: HttpClient) {}

  createUser(userData: CreateUserRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}`, userData);
  }

  getUsers(): Observable<UserRecordResponse[]> {
    return this.http.get<UserRecordResponse[]>(this.baseUrl).pipe(
      map((users) => {
        // Imprimir todos los usuarios que llegan para ver qué contiene 'modificationStatusDate' y 'creationDate'
        console.log('Usuarios recibidos:', users); // Imprime todos los usuarios

        return users.map((user) => {
          // Imprimir las fechas antes de formatearlas
          console.log(
            `User ${user.id} - creationDate: ${user.creationDate}, modificationStatusDate: ${user.modificationStatusDate}`
          );

          return {
            ...user,
            creationDate: this.formatDate(user.creationDate),
            modificationStatusDate: this.formatDate(
              user.modificationStatusDate
            ),
          };
        });
      })
    );
  }

  filterUsers(filters: any): Observable<UserRecordResponse[]> {
    return this.http
      .post<UserRecordResponse[]>(`${this.baseUrl}/filter`, filters)
      .pipe(
        map((users) => {
          // Imprimir todos los usuarios filtrados
          console.log('Usuarios filtrados recibidos:', users);

          return users.map((user) => {
            // Imprimir las fechas antes de formatearlas
            console.log(
              `User ${user.id} - creationDate: ${user.creationDate}, modificationStatusDate: ${user.modificationStatusDate}`
            );

            return {
              ...user,
              creationDate: this.formatDate(user.creationDate),
              modificationStatusDate: this.formatDate(
                user.modificationStatusDate
              ),
            };
          });
        })
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
      params: { email },
    });
  }

  toggleUserStatus(userId: number, isActive: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}`, { isActive });
  }

  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-'; // Si la fecha es vacía o nula, devolver "-"

    // Verificar si el formato es correcto
    const parts = dateString.split('-');
    if (parts.length !== 3) {
      console.error(`Fecha malformada: ${dateString}`); // Añadir log para depuración
      return '-'; // Si no es una fecha válida, devolver "-"
    }

    const [year, month, day] = parts;

    // Verificar que todos los valores sean números válidos
    if (isNaN(+year) || isNaN(+month) || isNaN(+day)) {
      console.error(`Fecha con valores inválidos: ${dateString}`); // Log de depuración
      return '-'; // Devolver "-" si los valores no son correctos
    }

    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`; // Formateo de la fecha
  }

  getUserByEmail(email: string): Observable<UserRecordResponse> {
    return this.http
      .get<UserRecordResponse>(`${this.baseUrl}/by-email`, {
        params: { email },
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
}
