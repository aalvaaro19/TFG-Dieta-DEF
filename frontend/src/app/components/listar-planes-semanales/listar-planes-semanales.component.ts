import { Component } from '@angular/core';
import { PlanSemanaService } from '../../service/plan-semana.service';
import { AuthService } from '../../service/auth.service';
import { PlanSemana } from '../../interface/plan-semana';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listar-planes-semanales',
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './listar-planes-semanales.component.html',
  styleUrl: './listar-planes-semanales.component.scss'
})
export class ListarPlanesSemanalesComponent {
planes: PlanSemana[] = [];
  planesFiltrados: PlanSemana[] = [];
  cargando = true;
  error: string | null = null;
  usuarioActual: any = null;
  esAdmin = false;
  
  // Filtros
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  filtroDiaSemana: string = '';
  filtroEstado: string = '';
  
  // Ordenamiento
  ordenActual: string = 'fechaInicio';
  ordenAscendente: boolean = true;

  // Días disponibles para filtro
  diasSemana: string[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  constructor(
    private planSemanaService: PlanSemanaService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    // Obtener usuario actual
    this.usuarioActual = await this.authService.currentUser.getValue();
    
    // Comprobar si el usuario es administrador (esto dependerá de tu sistema)
    // Por ejemplo, podrías comprobar un campo 'role' en el objeto de usuario
    // o hacer una llamada a un servicio que te diga si es admin
    try {
      // Esto es un ejemplo, reemplázalo con tu lógica real para verificar si es admin
      const token = await this.authService.getIdToken();
      // Aquí deberías tener una manera de verificar si el usuario es admin
      // Por ejemplo, podrías tener un endpoint específico o leer una propiedad del token
      // Por ahora, vamos a asumir que todos los usuarios autenticados pueden ver todos los planes
      this.esAdmin = true; // Esto debería ser reemplazado con tu lógica real
    } catch (error) {
      console.error('Error al verificar rol de usuario:', error);
      this.esAdmin = false;
    }
    
    await this.cargarPlanes();
  }

  async cargarPlanes() {
    try {
      this.cargando = true;
      this.error = null;

      if (this.usuarioActual) {
        if (this.esAdmin) {
          // Si es admin, cargar todos los planes
          this.planes = await this.planSemanaService.getAllPlanes();
        } else {
          // Si no es admin, cargar solo sus planes
          this.planes = await this.planSemanaService.getMisPlanesUsuario(this.usuarioActual.uid);
        }
      } else {
        // Si no hay usuario autenticado, mostrar mensaje
        this.error = 'Debes iniciar sesión para ver los planes';
        this.planes = [];
      }

      this.aplicarFiltros();
      this.ordenarPlanes();
      this.cargando = false;
    } catch (error) {
      this.cargando = false;
      this.error = 'Error al cargar los planes semanales';
      console.error('Error al cargar los planes:', error);
    }
  }

  async eliminarPlan(id: string) {
    if (confirm('¿Está seguro que desea eliminar este plan semanal?')) {
      try {
        const resultado = await this.planSemanaService.deletePlan(id);
        if (resultado) {
          this.planes = this.planes.filter(plan => plan.id_PlanSemana !== id);
          this.aplicarFiltros();
          this.ordenarPlanes();
        } else {
          alert('No se pudo eliminar el plan');
        }
      } catch (error) {
        console.error('Error al eliminar plan:', error);
        alert('Error al eliminar el plan');
      }
    }
  }

  aplicarFiltros() {
    this.planesFiltrados = this.planes.filter(plan => {
      // Filtrar por fecha de inicio
      const cumpleFechaInicio = !this.filtroFechaInicio || 
                               plan.fechaInicio.includes(this.filtroFechaInicio);
      
      // Filtrar por fecha de fin
      const cumpleFechaFin = !this.filtroFechaFin || 
                            plan.fechaFin.includes(this.filtroFechaFin);
      
      // Filtrar por día de la semana (si el plan contiene ese día)
      const cumpleDiaSemana = !this.filtroDiaSemana || 
                              plan.diasSemana.includes(this.filtroDiaSemana);
      
      // Filtrar por estado
      const cumpleEstado = !this.filtroEstado || 
                          plan.estadoPlan === this.filtroEstado;
      
      return cumpleFechaInicio && cumpleFechaFin && cumpleDiaSemana && cumpleEstado;
    });
  }

  ordenarPlanes() {
    this.planesFiltrados.sort((a, b) => {
      let valorA, valorB;
      
      // Determinar qué valores comparar según el campo de ordenamiento
      switch (this.ordenActual) {
        case 'fechaInicio':
          valorA = a.fechaInicio || '';
          valorB = b.fechaInicio || '';
          break;
        case 'fechaFin':
          valorA = a.fechaFin || '';
          valorB = b.fechaFin || '';
          break;
        case 'estado':
          valorA = a.estadoPlan || '';
          valorB = b.estadoPlan || '';
          break;
        case 'diasSemana':
          valorA = a.diasSemana.length || 0;
          valorB = b.diasSemana.length || 0;
          break;
        default:
          valorA = a.fechaInicio || '';
          valorB = b.fechaInicio || '';
      }
      
      // Realizar la comparación en el orden correcto
      if (this.ordenAscendente) {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });
  }

  cambiarOrden(campo: string) {
    if (this.ordenActual === campo) {
      // Si ya estamos ordenando por este campo, invertir el orden
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      // Si es un nuevo campo de ordenamiento, establecerlo y ordenar ascendente
      this.ordenActual = campo;
      this.ordenAscendente = true;
    }
    this.ordenarPlanes();
  }

  onFiltroChange() {
    this.aplicarFiltros();
    this.ordenarPlanes();
  }

  limpiarFiltros() {
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroDiaSemana = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
    this.ordenarPlanes();
  }

  async refrescarLista() {
    await this.cargarPlanes();
  }
  
  contarDias(plan: PlanSemana): number {
    return plan.diasSemana?.length || 0;
  }
  
  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVO':
        return 'bg-green-100 text-green-800';
      case 'COMPLETADO':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getDiasSemanaFormateados(plan: PlanSemana): string {
    if (!plan.diasSemana || plan.diasSemana.length === 0) {
      return 'Ninguno';
    }
    
    // Si hay muchos días, mostrar solo los primeros y un contador
    if (plan.diasSemana.length > 3) {
      const primerosDias = plan.diasSemana.slice(0, 3).map(d => this.formatearDia(d)).join(', ');
      return `${primerosDias} y ${plan.diasSemana.length - 3} más`;
    }
    
    return plan.diasSemana.map(d => this.formatearDia(d)).join(', ');
  }
  
  formatearDia(dia: string): string {
    // Si el día es un ID, podríamos necesitar buscar el día en otra fuente de datos
    // Por ahora, solo formateamos el nombre del día
    if (this.diasSemana.includes(dia)) {
      return dia.charAt(0) + dia.slice(1).toLowerCase();
    }
    return dia;
  }
}
