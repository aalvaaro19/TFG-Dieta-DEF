import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, lastValueFrom, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Convertir la promesa en un observable
    return from(this.addToken(request)).pipe(
      switchMap(requestWithToken => next.handle(requestWithToken)),
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Si hay error 401, intentar refrescar el token y reintentar
          return from(this.handleTokenRefresh(request, next));
        }
        return throwError(() => error);
      })
    );
  }

  private async addToken(request: HttpRequest<any>): Promise<HttpRequest<any>> {
    // Solo agregar token si no es una petición de login o registro
    if (request.url.includes('/api/auth/') || request.url.includes('/api/users/createUser')) {
      return request;
    }

    const token = await this.authService.getIdToken();
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return request;
  }

  private async handleTokenRefresh(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    try {
      // Forzar renovación del token
      const newToken = await this.authService.getIdToken();
      if (!newToken) {
        throw new Error('No se pudo obtener un nuevo token');
      }
      
      // Crear nueva petición con token actualizado
      const requestWithNewToken = request.clone({
        setHeaders: {
          Authorization: `Bearer ${newToken}`
        }
      });
      
      // Procesar la nueva petición
      return await lastValueFrom(next.handle(requestWithNewToken));
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return Promise.reject(new Error('Error de autenticación'));
    }
  }
}