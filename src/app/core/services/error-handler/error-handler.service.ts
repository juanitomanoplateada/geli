// src/app/core/services/error-handler/error-handler.service.ts
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../interfaces/error-response.interface';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  constructor(private router: Router) {}

  public handleError(error: Error | HttpErrorResponse): void {
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleClientError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    console.error('HTTP Error:', error);

    const errorResponse: ErrorResponse = {
      message: error.message,
      status: error.status,
      timestamp: new Date().toISOString(),
    };

    // Intentar extraer el mensaje de error del body si existe
    try {
      const body = error.error;
      if (typeof body === 'string') {
        errorResponse.message = body;
      } else if (body?.message) {
        errorResponse.message = body.message;
        errorResponse.details = body.details;
      }
    } catch (e) {
      console.warn('Could not parse error body', e);
    }

    switch (error.status) {
      case 0:
        errorResponse.message =
          'No se pudo conectar al servidor. Verifique su conexión a internet.';
        break;
      case 400:
        errorResponse.message =
          errorResponse.message ||
          'Solicitud incorrecta. Verifique los datos ingresados.';
        break;
      case 401:
        errorResponse.message =
          'No autorizado. Por favor inicie sesión nuevamente.';
        this.router.navigate(['/auth/login']);
        break;
      case 403:
        errorResponse.message = 'No tiene permisos para realizar esta acción.';
        break;
      case 404:
        errorResponse.message = 'Recurso no encontrado.';
        break;
      case 500:
        errorResponse.message =
          'Error interno del servidor. Por favor contacte al administrador.';
        break;
      default:
        errorResponse.message = errorResponse.message || 'Error desconocido.';
    }
  }

  private handleClientError(error: Error): void {
    console.error('Client Error:', error);
  }
}
