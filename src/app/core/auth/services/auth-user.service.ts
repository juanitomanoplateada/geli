import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../../services/user/user.service';
import { UserRecordResponse } from '../../dto/user/record-user-response.dto';
import { decodeToken } from './token.utils';

@Injectable({
  providedIn: 'root',
})
export class AuthUserService {
  constructor(private userService: UserService) {}

  /**
   * Obtiene el usuario autenticado actual a partir del token local
   */
  getAuthenticatedUser(): Observable<UserRecordResponse> {
    const token = localStorage.getItem('auth_token');
    if (!token) return throwError(() => new Error('No hay token'));

    const decoded: any = decodeToken(token);
    const email = decoded?.email || decoded?.preferred_username;
    if (!email)
      return throwError(() => new Error('No se pudo obtener el email'));

    return this.userService.getUserByEmail(email).pipe(
      catchError((error) => {
        console.error('Error al obtener el usuario autenticado', error);
        return throwError(() => new Error('Usuario no encontrado'));
      })
    );
  }

  /**
   * Obtiene solo el ID del usuario autenticado
   */
  getAuthenticatedUserId(): Observable<number> {
    return this.getAuthenticatedUser().pipe(map((user) => user.id));
  }
}
