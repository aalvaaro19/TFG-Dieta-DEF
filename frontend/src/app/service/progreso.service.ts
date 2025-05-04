import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Progreso } from '../interface/progreso';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProgresoService {
  private apiUrl = 'http://localhost:8080/api/progresos';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private withAuthHeaders(callback: (headers: HttpHeaders) => Observable<any>): Observable<any> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        if (!token) {
          console.error('No authentication token available');
          return throwError(() => new Error('Authentication required'));
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return callback(headers);
      }),
      catchError(error => {
        console.error('Error in API request:', error);
        return throwError(() => error);
      })
    );
  }

  getProgresosByUserId(userId: string): Observable<Progreso[]> {
    return this.withAuthHeaders(headers =>
      this.http.get<Progreso[]>(`${this.apiUrl}/progresoUsuario/${userId}`, { headers })
    );
  }

  getProgresoById(id: string): Observable<Progreso> {
    return this.withAuthHeaders(headers =>
      this.http.get<Progreso>(`${this.apiUrl}/progreso/${id}`, { headers })
    );
  }

  createProgreso(progreso: Progreso): Observable<any> {
    return this.withAuthHeaders(headers =>
      this.http.post(`${this.apiUrl}/guardarProgreso`, progreso, { headers })
    );
  }

  updateProgreso(progreso: Progreso): Observable<any> {
    if (!progreso.id_progreso) {
      return throwError(() => new Error('ID de progreso es requerido para actualizar'));
    }

    return this.withAuthHeaders(headers =>
      this.http.put(`${this.apiUrl}/actualizarProgreso`, progreso, { headers })
    );
  }

  deleteProgreso(id: string): Observable<any> {
    if (!id) {
      return throwError(() => new Error('ID de progreso es requerido para eliminar'));
    }

    return this.withAuthHeaders(headers =>
      this.http.delete(`${this.apiUrl}/eliminarProgreso/${id}`, { headers })
    );
  }

  getAllProgresos(): Observable<Progreso[]> {
    return this.withAuthHeaders(headers =>
      this.http.get<Progreso[]>(`${this.apiUrl}/admin/all`, { headers })
    );
  }

  deleteAllProgresos(): Observable<any> {
    return this.withAuthHeaders(headers =>
      this.http.delete(`${this.apiUrl}/admin/deleteAll`, { headers })
    );
  }
}
