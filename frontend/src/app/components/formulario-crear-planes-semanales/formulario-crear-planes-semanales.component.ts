import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanSemanaService } from '../../service/plan-semana.service';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { PlanSemana } from '../../interface/plan-semana';
import { DiaSemana } from '../../interface/dia-semana';
import { DiaSemanaService } from '../../service/dia-semana.service';

@Component({
  selector: 'app-formulario-crear-planes-semanales',
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-crear-planes-semanales.component.html',
  styleUrl: './formulario-crear-planes-semanales.component.scss'
})
export class FormularioCrearPlanesSemanalesComponent {
// Modelo para el formulario
  plan: PlanSemana = {
    id_PlanSemana: '',
    id_usuario: '',
    diasSemana: [],
    fechaInicio: '',
    fechaFin: '',
    estadoPlan: 'PENDIENTE'
  };

  // Días disponibles en la base de datos
  diasDisponibles: DiaSemana[] = [];
  diasSeleccionados: string[] = []; // IDs de los días seleccionados

  // Días de la semana para selección
  diasSemana: string[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  
  // Estado del formulario
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  cargandoDias = false;

  constructor(
    private planSemanaService: PlanSemanaService,
    private diaSemanaService: DiaSemanaService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Obtener el ID del usuario actual
    const currentUser = await this.authService.currentUser.getValue();
    if (currentUser) {
      this.plan.id_usuario = currentUser.uid;
    } else {
      this.errorMessage = 'Debes iniciar sesión para crear un plan semanal';
    }

    // Cargar los días disponibles
    await this.cargarDiasDisponibles();

    // Verificar si estamos en modo edición (URL contiene un ID)
    const url = window.location.href;
    const idMatch = url.match(/editar-plan\/([^\/]+)/);
    
    if (idMatch && idMatch[1]) {
      this.isEditing = true;
      const planId = idMatch[1];
      await this.cargarPlan(planId);
    } else {
      // Generar ID para nuevo plan
      this.plan.id_PlanSemana = this.planSemanaService.generateUniqueId();
      
      // Establecer fechas por defecto (inicio: hoy, fin: dentro de 7 días)
      const hoy = new Date();
      const finPlan = new Date();
      finPlan.setDate(hoy.getDate() + 7);
      
      this.plan.fechaInicio = hoy.toISOString().split('T')[0];
      this.plan.fechaFin = finPlan.toISOString().split('T')[0];
    }
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
      const planCargado = await this.planSemanaService.getPlanById(id);
      if (planCargado) {
        this.plan = planCargado;
        // Actualizar días seleccionados
        this.diasSeleccionados = this.plan.diasSemana;
      } else {
        this.errorMessage = 'No se pudo encontrar el plan con ID: ' + id;
      }
    } catch (error) {
      this.errorMessage = 'Error al cargar el plan: ' + (error as Error).message;
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
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800';
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
      let resultado: boolean;
      
      if (this.isEditing) {
        resultado = await this.planSemanaService.updatePlan(this.plan);
        if (resultado) {
          this.successMessage = 'Plan actualizado correctamente';
        }
      } else {
        resultado = await this.planSemanaService.savePlan(this.plan);
        if (resultado) {
          this.successMessage = 'Plan creado correctamente';
          // Resetear el formulario para un nuevo plan
          this.resetearFormulario();
        }
      }

      if (!resultado) {
        this.errorMessage = 'No se pudo guardar el plan';
      }
    } catch (error) {
      this.errorMessage = 'Error al guardar el plan: ' + (error as Error).message;
    } finally {
      this.isSaving = false;
    }
  }

  validarFormulario(): boolean {
    if (!this.plan.id_usuario) {
      this.errorMessage = 'Debes iniciar sesión para crear un plan';
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

  resetearFormulario() {
    // Mantener el ID de usuario pero resetear el resto del formulario
    const userId = this.plan.id_usuario;
    
    this.plan = {
      id_PlanSemana: this.planSemanaService.generateUniqueId(),
      id_usuario: userId,
      diasSemana: [],
      fechaInicio: '',
      fechaFin: '',
      estadoPlan: 'PENDIENTE'
    };
    
    // Resetear días seleccionados
    this.diasSeleccionados = [];

    // Establecer fechas por defecto
    const hoy = new Date();
    const finPlan = new Date();
    finPlan.setDate(hoy.getDate() + 7);
    
    this.plan.fechaInicio = hoy.toISOString().split('T')[0];
    this.plan.fechaFin = finPlan.toISOString().split('T')[0];
  }

  cancelar() {
    // Navegar a la lista de planes o a la página principal
    this.router.navigate(['/planes-semanales']);
  }
}
