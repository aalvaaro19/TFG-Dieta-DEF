import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PlanSemana } from '../interface/plan-semana';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlanSemanaService {
  private baseUrl = 'http://localhost:8080/api/planes-semana';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Método para obtener todos los planes de la semana (solo admin)
  async getAllPlanes(): Promise<PlanSemana[]> {
    try {
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const result = await firstValueFrom(
        this.http.get<PlanSemana[]>(`${this.baseUrl}/admin/getAllPlanes`, { headers })
      );
      console.log(`Obtenidos ${result.length} planes de la semana`);
      return result;
    } catch (error) {
      console.error('Error al obtener los planes de la semana:', error);
      return [];
    }
  }

  // Método para obtener un plan específico por ID (solo admin)
  async getPlanById(id: string): Promise<PlanSemana | null> {
    try {
      if (!id) {
        console.error("El ID del plan no puede estar vacío");
        return null;
      }
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const result = await firstValueFrom(
        this.http.get<PlanSemana>(`${this.baseUrl}/admin/getPlan/${id}`, { headers })
      );
      console.log(`Plan obtenido con ID: ${id}`);
      return result;
    } catch (error) {
      console.error(`Error al obtener el plan con ID ${id}:`, error);
      return null;
    }
  }

  // Método para guardar un nuevo plan
  async savePlan(plan: PlanSemana): Promise<boolean> {
    try {
      console.log('Preparando para guardar plan:', JSON.stringify(plan));
      
      // Si está en modo creación, eliminar el ID para que el backend lo genere
      const planToSave = { ...plan };
      if (!planToSave.id_PlanSemana) {
        delete planToSave.id_PlanSemana;
      }
      
      console.log('Plan procesado para enviar:', JSON.stringify(planToSave));
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/admin/savePlan`, planToSave, { 
          headers,
          responseType: 'text'
        })
      );
      
      console.log('Plan guardado correctamente');
      return true;
    } catch (error) {
      console.error('Error completo al guardar plan:', error);
      return false;
    }
  }

  // Método para actualizar un plan existente
  async updatePlan(plan: PlanSemana): Promise<boolean> {
    try {
      if (!plan.id_PlanSemana) {
        console.error("No se puede actualizar un plan sin ID");
        return false;
      }
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(
        this.http.put(`${this.baseUrl}/admin/updatePlan`, plan, { headers })
      );
      console.log('Plan actualizado correctamente con ID:', plan.id_PlanSemana);
      return true;
    } catch (error) {
      console.error('Error al actualizar el plan:', error);
      return false;
    }
  }

  // Método para eliminar un plan por ID
  async deletePlan(id: string): Promise<boolean> {
    try {
      if (!id) {
        console.error("El ID del plan no puede estar vacío");
        return false;
      }
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(
        this.http.delete(`${this.baseUrl}/admin/deletePlan/${id}`, { headers })
      );
      console.log('Plan eliminado correctamente con ID:', id);
      return true;
    } catch (error) {
      console.error(`Error al eliminar el plan con ID ${id}:`, error);
      return false;
    }
  }

  // Método para eliminar todos los planes
  async deleteAllPlanes(): Promise<boolean> {
    try {
      const confirmacion = confirm("¿Está seguro de eliminar TODOS los planes? Esta acción no se puede deshacer.");
      if (!confirmacion) {
        return false;
      }
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(
        this.http.delete(`${this.baseUrl}/admin/deleteAllPlanes`, { headers })
      );
      console.log('Todos los planes eliminados correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar todos los planes:', error);
      return false;
    }
  }

  // Método para obtener los planes de un usuario específico
  async getMisPlanesUsuario(idUsuario: string): Promise<PlanSemana[]> {
    try {
      if (!idUsuario) {
        console.error("El ID de usuario no puede estar vacío");
        return [];
      }
      
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const result = await firstValueFrom(
        this.http.get<PlanSemana[]>(`${this.baseUrl}/users/getMisPlanes/${idUsuario}`, { headers })
      );
      console.log(`Obtenidos ${result.length} planes para el usuario ${idUsuario}`);
      return result;
    } catch (error) {
      console.error(`Error al obtener los planes del usuario ${idUsuario}:`, error);
      return [];
    }
  }

  // Método para comprobar si existe un plan
  async existsPlan(id: string): Promise<boolean> {
    try {
      if (!id) {
        return false;
      }
      
      const plan = await this.getPlanById(id);
      return plan !== null;
    } catch (error) {
      console.error(`Error al verificar si existe el plan con ID ${id}:`, error);
      return false;
    }
  }

  // Método para generar un ID único para nuevos planes
  generateUniqueId(): string {
    return 'plan_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
  }
}