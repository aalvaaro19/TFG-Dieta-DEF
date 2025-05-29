import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../service/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado-progresos',
  imports: [CommonModule],
  templateUrl: './listado-progresos.component.html',
  styleUrl: './listado-progresos.component.scss'
})
export class ListadoProgresosComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api/progresos';
  progresos: any[] = [];
  userMap: { [key: string]: any } = {};
  loading = false;
  error = '';

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private router: Router
  ) {}

  async ngOnInit() {
    console.log('ListadoProgresosComponent: ngOnInit iniciado');
    this.loading = true;
    this.error = '';
    
    try {
      // Esperar a que el usuario esté autenticado
      const user = await this.authService.getCurrentUser();
      console.log('Usuario obtenido:', user);
      
      if (!user) {
        this.error = 'No se ha encontrado el usuario autenticado.';
        this.loading = false;
        return;
      }

      const userId = user.uid;
      console.log('User ID:', userId);

      if (!userId) {
        this.error = 'No se ha encontrado el ID del usuario.';
        this.loading = false;
        return;
      }

      await this.getUserProgresos(userId);
    } catch (err) {
      this.error = 'Error al cargar los progresos.';
      console.error('Error en ngOnInit:', err);
    } finally {
      this.loading = false;
    }
  }

  // Obtener todos los progresos de un usuario
  async getUserProgresos(userId: string) {
    try {
      const user = await this.authService.getCurrentUser();
      const token = user ? await user.getIdToken() : null;
      console.log('Llamando a endpoint:', `${this.apiUrl}/progresoUsuario/${userId}`);

      const response = await this.http.get<any[]>(
        `${this.apiUrl}/progresoUsuario/${userId}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      ).toPromise();
      console.log('Respuesta cruda:', response);

      this.progresos = Array.isArray(response) ? response : Object.values(response || {});

      // Ordenar por fecha ascendente (más viejo a más nuevo)
      this.progresos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      console.log('getUserProgresos:', this.progresos);
    } catch (error) {
      this.error = 'Error al cargar los progresos del usuario.';
      this.loading = false;
      console.error('Error en getUserProgresos:', error);
    }
  }

  // Eliminar un progreso por su ID
  async deleteProgreso(id_progreso: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro de progreso?')) {
      return;
    }

    try {
      const user = await this.authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const token = await user.getIdToken();

      await this.http.delete<void>(
        `${this.apiUrl}/eliminarProgreso/${id_progreso}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      // Elimina el progreso del array local
      this.progresos = this.progresos.filter(p => p.id_progreso !== id_progreso);
      console.log('Progreso eliminado:', id_progreso);
    } catch (error) {
      console.error('Error al eliminar el progreso:', error);
      alert('Error al eliminar el progreso');
    }
  }

  // Métodos para manejar valores y cálculos
  getProgresoAnterior(index: number): any | null {
    if (index <= 0 || index >= this.progresos.length) {
      return null;
    }
    return this.progresos[index - 1];
  }

  parseNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  calcularDiferencia(valorActual: any, valorAnterior: any): number {
    const numActual = this.parseNumber(valorActual);
    const numAnterior = this.parseNumber(valorAnterior);
    return parseFloat((numActual - numAnterior).toFixed(2));
  }

  getColorClase(diferencia: number): string {
    if (diferencia > 0) {
      return 'text-red-600 font-medium';
    } else if (diferencia < 0) {
      return 'text-green-600 font-medium';
    }
    return 'text-gray-600';
  }

  // Para algunos valores como masa muscular, un aumento es generalmente positivo
  getColorClaseInvertido(diferencia: number): string {
    if (diferencia > 0) {
      return 'text-green-600 font-medium';
    } else if (diferencia < 0) {
      return 'text-red-600 font-medium';
    }
    return 'text-gray-600';
  }

  formatDiferencia(diferencia: number): string {
    const signo = diferencia > 0 ? '+' : '';
    return `${signo}${diferencia}`;
  }

  getUserName(userId: string): string {
    const user = this.userMap[userId];
    return user ? (user.nombreUsuario || user.nombreCompleto || 'Usuario') : 'Mi progreso';
  }

  formatDate(dateString: string): string {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  goToNewProgreso() {
    console.log('Navegando a /formularioProgreso');
    this.router.navigate(['/formularioProgreso']);
  }
}