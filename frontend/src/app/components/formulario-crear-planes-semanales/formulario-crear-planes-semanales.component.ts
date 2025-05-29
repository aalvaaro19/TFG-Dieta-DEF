import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanSemanaService } from '../../service/plan-semana.service';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { PlanSemana } from '../../interface/plan-semana';
import { DiaSemana } from '../../interface/dia-semana';
import { DiaSemanaService } from '../../service/dia-semana.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

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

  // Usuarios disponibles para seleccionar
  usuariosDisponibles: any[] = [];

  // Días de la semana para selección
  diasSemana: string[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  
  // Estado del formulario
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  cargandoDias = false;
  cargandoUsuarios = false;

  // Usuario autenticado actual
  usuarioAutenticado: any = null;

  constructor(
    private planSemanaService: PlanSemanaService,
    private diaSemanaService: DiaSemanaService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private auth: Auth
  ) {}

  async ngOnInit() {
    // Verificar autenticación
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.usuarioAutenticado = user;
        console.log('Usuario autenticado:', user);
        
        // Cargar datos iniciales
        await this.inicializarFormulario();
      } else {
        console.error('Usuario no autenticado');
        this.errorMessage = 'Debes iniciar sesión para acceder al formulario';
        this.router.navigate(['/login']);
      }
    });
  }

  async inicializarFormulario() {
    // Cargar usuarios disponibles
    await this.cargarUsuarios();
    
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

  async cargarUsuarios() {
    try {
      this.cargandoUsuarios = true;
      this.errorMessage = '';
      
      const token = await this.usuarioAutenticado.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      // Obtener todos los usuarios
      this.usuariosDisponibles = await firstValueFrom(
        this.http.get<any[]>('http://localhost:8080/api/admin/users/getAllUsers', { headers })
      );
      
      console.log('Usuarios cargados:', this.usuariosDisponibles);
      this.cargandoUsuarios = false;
    } catch (error) {
      this.cargandoUsuarios = false;
      this.errorMessage = 'Error al cargar los usuarios: ' + (error as any).message;
      console.error('Error al cargar usuarios:', error);
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

  // Obtener el nombre completo del usuario seleccionado
  obtenerNombreUsuario(userId: string): string {
    const usuario = this.usuariosDisponibles.find(u => u.id_usuario === userId);
    return usuario ? `${usuario.nombreCompleto} (${usuario.email})` : 'Usuario no encontrado';
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
      this.errorMessage = 'Debes seleccionar un usuario para asignar el plan';
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
    this.plan = {
      id_PlanSemana: this.planSemanaService.generateUniqueId(),
      id_usuario: '',
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