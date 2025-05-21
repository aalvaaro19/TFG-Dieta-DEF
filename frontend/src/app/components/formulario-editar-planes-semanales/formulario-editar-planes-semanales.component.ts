import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiaSemana } from '../../interface/dia-semana';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { DiaSemanaService } from '../../service/dia-semana.service';
import { PlanSemanaService } from '../../service/plan-semana.service';
import { PlanSemana } from '../../interface/plan-semana';

@Component({
  selector: 'app-formulario-editar-planes-semanales',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './formulario-editar-planes-semanales.component.html',
  styleUrl: './formulario-editar-planes-semanales.component.scss'
})
export class FormularioEditarPlanesSemanalesComponent {
// Modelo para el formulario
  plan: PlanSemana = {
    id_PlanSemana: '',
    id_usuario: '',
    diasSemana: [],
    fechaInicio: '',
    fechaFin: '',
    estadoPlan: ''
  };

  // Días disponibles en la base de datos
  diasDisponibles: DiaSemana[] = [];
  diasSeleccionados: string[] = []; // IDs de los días seleccionados

  // Días de la semana para selección
  diasSemana: string[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  
  // Estado del formulario
  isSaving = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  cargandoDias = false;
  planId = '';

  constructor(
    private planSemanaService: PlanSemanaService,
    private diaSemanaService: DiaSemanaService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Obtener el ID del plan de la ruta
    this.route.params.subscribe(async (params: import('@angular/router').Params) => {
      if (params['id']) {
        this.planId = params['id'];
        await this.cargarDiasDisponibles();
        await this.cargarPlan(this.planId);
      } else {
        this.errorMessage = 'No se ha proporcionado un ID de plan válido';
        this.isLoading = false;
      }
    });
  }

  async cargarDiasDisponibles() {
    try {
      this.cargandoDias = true;
      this.errorMessage = '';
      this.diasDisponibles = await this.diaSemanaService.getAllDias();
      this.cargandoDias = false;
    } catch (error) {
      this.cargandoDias = false;
      this.errorMessage = 'Error al cargar los días disponibles: ' + (error as Error).message;
      console.error('Error al cargar los días:', error);
    }
  }

  async cargarPlan(id: string) {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      const planCargado = await this.planSemanaService.getPlanById(id);
      if (planCargado) {
        this.plan = planCargado;
        
        // Actualizar días seleccionados
        this.diasSeleccionados = [...this.plan.diasSemana];
        
        // Verificar si el usuario actual es el propietario del plan
        const currentUser = await this.authService.currentUser.getValue();
        if (currentUser && this.plan.id_usuario !== currentUser.uid) {
          // Verificar si el usuario es administrador
          // Aquí deberías implementar tu lógica para verificar si el usuario es admin
          const esAdmin = true; // Reemplazar con tu lógica real
          
          if (!esAdmin) {
            this.errorMessage = 'No tienes permiso para editar este plan';
            this.router.navigate(['/planes-semanales']);
            return;
          }
        }
      } else {
        this.errorMessage = 'No se encontró el plan con ID: ' + id;
        setTimeout(() => {
          this.router.navigate(['/planes-semanales']);
        }, 2000);
      }
    } catch (error) {
      this.errorMessage = 'Error al cargar el plan: ' + (error as Error).message;
      console.error('Error al cargar el plan:', error);
    } finally {
      this.isLoading = false;
    }
  }

  toggleDia(diaId: string) {
    const index = this.diasSeleccionados.indexOf(diaId);
    if (index === -1) {
      // Si no está en el array, lo añadimos
      this.diasSeleccionados.push(diaId);
    } else {
      // Si ya está en el array, lo quitamos
      this.diasSeleccionados.splice(index, 1);
    }
    // Actualizar el modelo del plan
    this.plan.diasSemana = [...this.diasSeleccionados];
  }

  isDiaSelected(diaId: string): boolean {
    return this.diasSeleccionados.includes(diaId);
  }

  getDiaDisponiblesParaDiaSemana(diaSemana: string): DiaSemana[] {
    return this.diasDisponibles.filter(dia => 
      dia.dia_semana === diaSemana || 
      (typeof dia.dia_semana === 'object' && dia.dia_semana.toString() === diaSemana)
    );
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

  async guardarPlan() {
    // Validar el formulario
    if (!this.validarFormulario()) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const resultado = await this.planSemanaService.updatePlan(this.plan);
      
      if (resultado) {
        this.successMessage = 'Plan actualizado correctamente';
        setTimeout(() => {
          this.router.navigate(['/planes-semanales']);
        }, 2000);
      } else {
        this.errorMessage = 'No se pudo actualizar el plan';
      }
    } catch (error) {
      this.errorMessage = 'Error al actualizar el plan: ' + (error as Error).message;
      console.error('Error al actualizar el plan:', error);
    } finally {
      this.isSaving = false;
    }
  }

  validarFormulario(): boolean {
    if (!this.plan.id_usuario) {
      this.errorMessage = 'El plan debe estar asociado a un usuario';
      return false;
    }

    if (this.plan.diasSemana.length === 0) {
      this.errorMessage = 'Debes seleccionar al menos un día para el plan';
      return false;
    }

    if (!this.plan.fechaInicio || !this.plan.fechaFin) {
      this.errorMessage = 'Las fechas de inicio y fin son obligatorias';
      return false;
    }

    const fechaInicio = new Date(this.plan.fechaInicio);
    const fechaFin = new Date(this.plan.fechaFin);

    if (fechaInicio > fechaFin) {
      this.errorMessage = 'La fecha de inicio no puede ser posterior a la fecha de fin';
      return false;
    }

    return true;
  }

  cancelar() {
    // Navegar a la lista de planes
    this.router.navigate(['/planes-semanales']);
  }
}
