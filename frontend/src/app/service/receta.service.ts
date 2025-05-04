import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Receta } from '../interface/receta';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  private apiUrl = 'http://localhost:8080/api/recetas';

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

  getRecetasByToken(): Observable<Receta[]> {
    return this.withAuthHeaders(headers =>
      this.http.get<Receta[]>(`${this.apiUrl}/admin/recetas/getAllRecetas`, { headers })
    );
  }

  getAllRecetas(): Observable<Receta[]> {
    return this.withAuthHeaders(headers =>
      this.http.get<Receta[]>(`${this.apiUrl}/admin/recetas/getAllRecetas`, { headers })
    );
  }

  getRecetaById(id: string): Observable<Receta> {
    return this.withAuthHeaders(headers =>
      this.http.get<Receta>(`${this.apiUrl}/admin/recetas/getReceta/${id}`, { headers })
    );
  }

  createReceta(receta: Receta): Observable<any> {
    return this.withAuthHeaders(headers =>
      this.http.post(`${this.apiUrl}/admin/recetas/saveReceta`, receta, { headers })
    );
  }

  updateReceta(receta: Receta): Observable<any> {
    // Asegurarnos de que todos los campos necesarios estén presentes
    if (!receta.id_receta) {
      return throwError(() => new Error('ID de receta es requerido para actualizar'));
    }
    
    return this.withAuthHeaders(headers =>
      this.http.put(`${this.apiUrl}/admin/recetas/updateReceta`, receta, { headers })
    );
  }

  deleteReceta(id: string): Observable<any> {
    if (!id) {
      return throwError(() => new Error('ID de receta es requerido para eliminar'));
    }
    
    return this.withAuthHeaders(headers =>
      this.http.delete(`${this.apiUrl}/admin/recetas/deleteReceta/${id}`, { headers })
    );
  }

  deleteAllRecetas(): Observable<any> {
    return this.withAuthHeaders(headers =>
      this.http.delete(`${this.apiUrl}/admin/recetas/deleteAllRecetas`, { headers })
    );
  }
}