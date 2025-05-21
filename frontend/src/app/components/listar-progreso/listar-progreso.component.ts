import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgresoService } from '../../service/progreso.service';
import { AuthService } from '../../service/auth.service';
import { Progreso } from '../../interface/progreso';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-listar-progreso',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listar-progreso.component.html',
  styleUrl: './listar-progreso.component.scss'
})
export class ListarProgresoComponent implements OnInit {
  progresos: Progreso[] = [];
  loading = true;
  error = '';
  userId: string | null = null;
  userMap: { [key: string]: any } = {};

  constructor(
    private progresoService: ProgresoService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
  }

  async getCurrentUser() {
    try {
      const user = await this.authService.getCurrentUser();
      console.log('Current user:', user);
      
      if (user) {
        this.userId = user.uid;
        this.loadProgresos();
      } else {
        this.loading = false;
        this.error = 'Debes iniciar sesión para ver los registros de progreso';
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      this.loading = false;
      this.error = 'Error al obtener información del usuario';
    }
  }

  loadProgresos() {
    if (!this.userId) {
      this.loading = false;
      this.error = 'Error de autenticación. Inicia sesión nuevamente.';
      return;
    }

    console.log('Loading progress for user:', this.userId);

    this.progresoService.getProgresosByUserId(this.userId).subscribe({
      next: (data) => {
        console.log('Progress data received:', data);
        this.progresos = this.sortProgresosByDate(data);
        
        this.loadUsersInfo();
        console.log('Progresos sorted by date:', this.progresos);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading progress records:', err);
        this.loading = false;
        this.error = 'Error al cargar los registros de progreso: ' + (err.message || 'Intenta nuevamente');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  async loadUsersInfo() {
    const userIds = [...new Set(this.progresos.map(p => p.id_usuario))];
    
    if (userIds.length === 0) return;
    
    try {
      const token = await this.authService.getIdToken();
      if (!token) {
        console.error('No se pudo obtener el token de autenticación');
        return;
      }
      
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      for (const userId of userIds) {
        try {
          const user = await firstValueFrom(
            this.http.get<any>(`http://localhost:8080/api/users/profile/${userId}`, { headers })
          );
          
          this.userMap[userId] = user;
          console.log(`Usuario ${userId} cargado:`, user);
        } catch (err) {
          console.error(`Error al cargar información del usuario ${userId}:`, err);
        }
      }
    } catch (err) {
      console.error('Error al obtener token o cargar usuarios:', err);
    }
  }
  
  getUserName(userId: string): string {
    const user = this.userMap[userId];
    if (user) {
      return user.nombreUsuario || user.nombreCompleto || 'Usuario';
    }
    return userId;
  }

  sortProgresosByDate(progresos: Progreso[]): Progreso[] {
    return [...progresos].sort((a, b) => {
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });
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

  deleteProgreso(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de progreso?')) {
      this.progresoService.deleteProgreso(id).subscribe({
        next: () => {
          this.progresos = this.progresos.filter(p => p.id_progreso !== id);
        },
        error: (err) => {
          this.error = 'Error al eliminar el registro: ' + (err.message || 'Intenta nuevamente');
          console.error('Error deleting progress record:', err);
        }
      });
    }
  }

  // Métodos modificados para manejar valores string
  getProgresoAnterior(index: number): Progreso | null {
    if (index <= 0 || index >= this.progresos.length) {
      return null;
    }
    return this.progresos[index - 1];
  }

  // Convierte strings a números antes de calcular la diferencia
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
      return 'text-red-600 font-medium'; // Positivo (aumento) en rojo
    } else if (diferencia < 0) {
      return 'text-green-600 font-medium'; // Negativo (disminución) en verde
    }
    return 'text-gray-600';
  }

  // Para algunos valores como masa muscular, un aumento es generalmente positivo,
  // por lo que invertimos los colores
  getColorClaseInvertido(diferencia: number): string {
    if (diferencia > 0) {
      return 'text-green-600 font-medium'; // Positivo (aumento) en verde
    } else if (diferencia < 0) {
      return 'text-red-600 font-medium'; // Negativo (disminución) en rojo
    }
    return 'text-gray-600';
  }

  formatDiferencia(diferencia: number): string {
    const signo = diferencia > 0 ? '+' : '';
    return `${signo}${diferencia}`;
  }
}