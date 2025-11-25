import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const keycloakInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const keycloak = inject(KeycloakService);

  return from(keycloak.isLoggedIn()).pipe(
    switchMap((loggedIn) => {
      if (!loggedIn) {
        // Si no está logueado, redirige a login y no envía la request aún
        return from(keycloak.login()).pipe(switchMap(() => next(req)));
      }

      return from(keycloak.getToken()).pipe(
        switchMap((token) => {
          const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`),
          });
          return next(authReq); // next es HttpHandlerFn, se llama como función
        })
      );
    })
  );
};
