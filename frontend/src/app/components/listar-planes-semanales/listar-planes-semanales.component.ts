import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlanSemanaEnriquecido, PlanSemanaService } from '../../service/plan-semana.service';
import { DiasSemana } from '../../interface/dia-semana';
import { AuthService } from '../../service/auth.service'; // Asegúrate de tener este servicio
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-planes-semanales',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './listar-planes-semanales.component.html',
  styleUrls: ['./listar-planes-semanales.component.scss']
})
export class PlanesSemanalesComponent implements OnInit {
  planes: PlanSemanaEnriquecido[] = [];
  planesFiltrados: PlanSemanaEnriquecido[] = [];
  userMap: { [key: string]: any } = {};

  cargando = false;
  error = '';

  filtroFechaInicio = '';
  filtroFechaFin = '';
  filtroDiaSemana = '';
  filtroEstado = '';
  filtroUsuario = '';

  ordenActual = 'fechaInicio';
  ordenAscendente = true;

  diasSemana = Object.values(DiasSemana);
  estadosDisponibles = ['PENDIENTE', 'ACTIVO', 'COMPLETADO', 'CANCELADO'];

  constructor(
    private planSemanaService: PlanSemanaService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.cargarPlanes();
  }

 async cargarPlanes() {
  this.cargando = true;
  this.error = '';
  
  try {
    console.log('🔍 Cargando planes semanales...');
    this.planes = await this.planSemanaService.getAllPlanesEnriquecidos();

    // Cargar usuarios únicos
    const userIds = [...new Set(this.planes.map(p => p.id_usuario).filter(id => !!id))];
    await this.loadUsersInfo(userIds);

    console.log('✅ Planes cargados:', this.planes);
    this.aplicarFiltros();
  } catch (error: any) {
    console.error('❌ Error al cargar planes:', error);
    this.error = 'Error al cargar los planes semanales. Por favor, intenta nuevamente.';
  } finally {
    this.cargando = false;
  }
}

  aplicarFiltros() {
    let planesFiltrados = [...this.planes];

    if (this.filtroFechaInicio) {
      planesFiltrados = planesFiltrados.filter(plan =>
        plan.fechaInicio >= this.filtroFechaInicio
      );
    }

    if (this.filtroFechaFin) {
      planesFiltrados = planesFiltrados.filter(plan =>
        plan.fechaFin <= this.filtroFechaFin
      );
    }

    if (this.filtroDiaSemana) {
      planesFiltrados = planesFiltrados.filter(plan =>
        plan.diasSemanaInfo?.some(dia => dia.dia_semana === this.filtroDiaSemana)
      );
    }

    if (this.filtroEstado) {
      planesFiltrados = planesFiltrados.filter(plan =>
        plan.estadoPlan === this.filtroEstado
      );
    }

    if (this.filtroUsuario) {
      const filtro = this.filtroUsuario.toLowerCase();
      planesFiltrados = planesFiltrados.filter(plan =>
        plan.usuario?.nombre.toLowerCase().includes(filtro) ||
        plan.usuario?.email.toLowerCase().includes(filtro)
      );
    }

    this.ordenarPlanes(planesFiltrados);
    this.planesFiltrados = planesFiltrados;
  }

  ordenarPlanes(planes: PlanSemanaEnriquecido[]) {
    planes.sort((a, b) => {
      let valorA: any, valorB: any;

      switch (this.ordenActual) {
        case 'fechaInicio':
          valorA = new Date(a.fechaInicio);
          valorB = new Date(b.fechaInicio);
          break;
        case 'fechaFin':
          valorA = new Date(a.fechaFin);
          valorB = new Date(b.fechaFin);
          break;
        case 'estado':
          valorA = a.estadoPlan;
          valorB = b.estadoPlan;
          break;
        case 'usuario':
          valorA = a.usuario?.nombre || '';
          valorB = b.usuario?.nombre || '';
          break;
        case 'diasSemana':
          valorA = a.totalDias || 0;
          valorB = b.totalDias || 0;
          break;
        default:
          return 0;
      }

      return (valorA < valorB ? -1 : valorA > valorB ? 1 : 0) * (this.ordenAscendente ? 1 : -1);
    });
  }

  cambiarOrden(campo: string) {
    if (this.ordenActual === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenActual = campo;
      this.ordenAscendente = true;
    }
    this.aplicarFiltros();
  }

  onFiltroChange() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroDiaSemana = '';
    this.filtroEstado = '';
    this.filtroUsuario = '';
    this.aplicarFiltros();
  }

  async refrescarLista() {
    await this.cargarPlanes();
  }

  async eliminarPlan(idPlan: string) {
    if (!idPlan) {
      alert('ID de plan no válido');
      return;
    }

    const plan = this.planes.find(p => p.id_PlanSemana === idPlan);
    const nombrePlan = plan ? `del usuario ${plan.usuario?.nombre}` : '';

    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar el plan ${nombrePlan}?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    try {
      const resultado = await this.planSemanaService.deletePlan(idPlan);
      if (resultado) {
        alert('Plan eliminado correctamente');
        this.planes = this.planes.filter(p => p.id_PlanSemana !== idPlan);
        this.aplicarFiltros();
      } else {
        alert('Error al eliminar el plan');
      }
    } catch (error) {
      console.error('Error al eliminar plan:', error);
      alert('Error al eliminar el plan. Por favor, intenta nuevamente.');
    }
  }

  contarDias(plan: PlanSemanaEnriquecido): number {
    return this.planSemanaService.contarDias(plan);
  }

  getDiasSemanaFormateados(plan: PlanSemanaEnriquecido): string {
    return this.planSemanaService.getDiasSemanaFormateados(plan);
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-800';
      case 'COMPLETADO':
        return 'bg-blue-100 text-blue-800';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatearFecha(fecha: string): string {
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch {
      return fecha;
    }
  }

  getResumenPlan(plan: PlanSemanaEnriquecido): string {
    const dias = this.contarDias(plan);
    const usuario = this.getNombreUsuario(plan);
    return `${dias} día${dias !== 1 ? 's' : ''} - ${usuario}`;
  }

  // Esta función se mantiene si necesitas cargar usuarios por ID en otro contexto
  async loadUsersInfo(userIds: string[]) {
    try {
      const token = await this.authService.getIdToken();
      if (!token) {
        console.error('No se pudo obtener el token de autenticación');
        return;
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      for (const userId of userIds) {
        try {
          const user = await this.http.get<any>(
            `http://localhost:8080/api/users/profile/${userId}`,
            { headers }
          ).toPromise();
          this.userMap[userId] = user;
        } catch (err) {
          console.error(`Error al cargar información del usuario ${userId}:`, err);
        }
      }
    } catch (err) {
      console.error('Error al obtener token o cargar usuarios:', err);
    }
  }

  getNombreUsuario(plan: PlanSemanaEnriquecido): string {
    if (plan?.id_usuario) {
      return this.getUserName(plan.id_usuario);
    }
    return 'Usuario';
  }

  getUserName(userId: string): string {
    const user = this.userMap[userId];
    if (user) {
      return user.nombre || user.email || 'Usuario';
    }
    return 'Usuario';
  }
}
