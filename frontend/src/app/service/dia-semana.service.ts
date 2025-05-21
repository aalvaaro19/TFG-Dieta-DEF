import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DiaSemana } from '../interface/dia-semana';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DiaSemanaService {
  private baseUrl = 'http://localhost:8080/api/dias-semana';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Método para obtener todos los días de la semana
  async getAllDias(): Promise<DiaSemana[]> {
    try {
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const result = await firstValueFrom(
        this.http.get<DiaSemana[]>(`${this.baseUrl}/admin/dias-semana/getAllDias`, { headers })
      );
      console.log(`Obtenidos ${result.length} días de la semana`);
      return result;
    } catch (error) {
      console.error('Error al obtener los días de la semana:', error);
      return [];
    }
  }

  // Método para obtener un día específico por ID
  async getDiaById(id: string): Promise<DiaSemana | null> {
    try {
      if (!id) {
        console.error("El ID del día no puede estar vacío");
        return null;
      }
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const result = await firstValueFrom(
        this.http.get<DiaSemana>(`${this.baseUrl}/admin/dias-semana/getDia/${id}`, { headers })
      );
      console.log(`Día obtenido con ID: ${id}`);
      return result;
    } catch (error) {
      console.error(`Error al obtener el día con ID ${id}:`, error);
      return null;
    }
  }

  // Método para guardar un nuevo día
  async saveDia(dia: DiaSemana): Promise<string | null> {
    try {
      console.log('Preparando para guardar día:', JSON.stringify(dia));
      
      // Asegurar que el día de semana es una cadena, no un objeto enum
      const diaToSave = { 
        ...dia,
        dia_semana: typeof dia.dia_semana === 'object' ? dia.dia_semana.toString() : dia.dia_semana
      };
      
      // Si está en modo creación, eliminar el ID para que el backend lo genere
      if (!diaToSave.id_diaSemana) {
        delete diaToSave.id_diaSemana;
      }
      
      console.log('Día procesado para enviar:', JSON.stringify(diaToSave));
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      // Usar text() en lugar de json() para la respuesta
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/admin/dias-semana/saveDia`, diaToSave, { 
          headers,
          responseType: 'text'
        })
      );
      
      console.log('Respuesta del servidor:', response);
      return response || null;
    } catch (error) {
      console.error('Error completo al guardar día:', error);
      return null;
    }
  }

  // Método para actualizar un día existente
  async updateDia(dia: DiaSemana): Promise<boolean> {
    try {
      if (!dia.id_diaSemana) {
        console.error("No se puede actualizar un día sin ID");
        return false;
      }
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(
        this.http.put(`${this.baseUrl}/admin/dias-semana/updateDia`, dia, { headers })
      );
      console.log('Día actualizado correctamente con ID:', dia.id_diaSemana);
      return true;
    } catch (error) {
      console.error('Error al actualizar el día:', error);
      return false;
    }
  }

  // Método para eliminar un día por ID
  async deleteDia(id: string): Promise<boolean> {
    try {
      if (!id) {
        console.error("El ID del día no puede estar vacío");
        return false;
      }
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(
        this.http.delete(`${this.baseUrl}/admin/dias-semana/deleteDia/${id}`, { headers })
      );
      console.log('Día eliminado correctamente con ID:', id);
      return true;
    } catch (error) {
      console.error(`Error al eliminar el día con ID ${id}:`, error);
      return false;
    }
  }

  // Método para eliminar todos los días
  async deleteAllDias(): Promise<boolean> {
    try {
      const confirmacion = confirm("¿Está seguro de eliminar TODOS los días? Esta acción no se puede deshacer.");
      if (!confirmacion) {
        return false;
      }
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(
        this.http.delete(`${this.baseUrl}/admin/dias-semana/deleteAllDias`, { headers })
      );
      console.log('Todos los días eliminados correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar todos los días:', error);
      return false;
    }
  }

  // Método para obtener días por fecha
  async getDiasByFecha(fecha: string): Promise<DiaSemana[]> {
    try {
      if (!fecha) {
        console.error("La fecha no puede estar vacía");
        return [];
      }
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const result = await firstValueFrom(
        this.http.get<DiaSemana[]>(`${this.baseUrl}/admin/dias-semana/getDiasByFecha?fecha=${fecha}`, { headers })
      );
      console.log(`Obtenidos ${result.length} días para la fecha ${fecha}`);
      return result;
    } catch (error) {
      console.error(`Error al obtener los días para la fecha ${fecha}:`, error);
      return [];
    }
  }

  // Método para comprobar si existe un día
  async existsDia(id: string): Promise<boolean> {
    try {
      if (!id) {
        return false;
      }
      
      const dia = await this.getDiaById(id);
      return dia !== null;
    } catch (error) {
      console.error(`Error al verificar si existe el día con ID ${id}:`, error);
      return false;
    }
  }
}