import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PlanSemana } from '../interface/plan-semana';
import { AuthService } from './auth.service';
import { DiaSemanaService } from './dia-semana.service';

// Interface para el plan enriquecido con información adicional
export interface PlanSemanaEnriquecido extends PlanSemana {
  usuario?: {
    nombre: string;
    email: string;
    nombreCompleto?: string;
  };
  diasSemanaInfo?: {
    id: string;
    nombre: string;
    dia_semana: string;
    fechaDia?: string;
  }[];
  totalDias?: number;
  nombresDias?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanSemanaService {
  private baseUrl = 'http://localhost:8080/api/planes-semana';
  // Tabla de usuarios conocidos (temporal mientras se configura el endpoint)
  private usuariosConocidos: { [key: string]: { nombre: string, email: string } } = {
    'dLu5BrURVzXR3pfIEdpnswdhhut1': { nombre: 'Admin Principal', email: 'admin@app.com' },
    // Agregar más usuarios conocidos aquí según sea necesario
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private diaSemanaService: DiaSemanaService
  ) { }

  // Método para obtener todos los planes de la semana CON DATOS ENRIQUECIDOS
  async getAllPlanesEnriquecidos(): Promise<PlanSemanaEnriquecido[]> {
    try {
      const planesBasicos = await this.getAllPlanes();
      
      if (planesBasicos.length === 0) {
        return [];
      }

      // Enriquecer cada plan con información adicional
      const planesEnriquecidos = await Promise.all(
        planesBasicos.map(plan => this.enriquecerPlan(plan))
      );

      console.log(`Obtenidos ${planesEnriquecidos.length} planes enriquecidos`);
      return planesEnriquecidos;
    } catch (error) {
      console.error('Error al obtener planes enriquecidos:', error);
      return [];
    }
  }

  // Método para obtener todos los planes de la semana (solo admin) - ORIGINAL
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

  // Método para enriquecer un plan individual
  async enriquecerPlan(plan: PlanSemana): Promise<PlanSemanaEnriquecido> {
    const planEnriquecido: PlanSemanaEnriquecido = { ...plan };

    try {
      // Obtener información del usuario
      planEnriquecido.usuario = await this.obtenerInfoUsuario(plan.id_usuario);

      // Obtener información de los días de la semana
      if (plan.diasSemana && plan.diasSemana.length > 0) {
        planEnriquecido.diasSemanaInfo = await this.obtenerInfoDiasSemana(plan.diasSemana);
        planEnriquecido.totalDias = planEnriquecido.diasSemanaInfo.length;
        planEnriquecido.nombresDias = planEnriquecido.diasSemanaInfo
          .map(dia => dia.dia_semana)
          .join(', ');
      }

      return planEnriquecido;
    } catch (error) {
      console.error('Error enriqueciendo plan:', error);
      return planEnriquecido;
    }
  }

  // Obtener información del usuario - VERSIÓN MEJORADA
  private async obtenerInfoUsuario(idUsuario: string): Promise<any> {
    try {
      console.log('🔍 Obteniendo información del usuario:', idUsuario);
      
      if (!idUsuario) {
        return { nombre: 'Sin usuario', email: '', nombreCompleto: '' };
      }

      // Método 1: Verificar tabla de usuarios conocidos
      const usuarioConocido = this.usuariosConocidos[idUsuario];
      if (usuarioConocido) {
        console.log('✅ Usuario encontrado en tabla conocidos:', usuarioConocido);
        return {
          nombre: usuarioConocido.nombre,
          email: usuarioConocido.email,
          nombreCompleto: usuarioConocido.nombre
        };
      }

      // Método 2: Obtener el usuario actual para comparar
      const currentUserSubject = this.authService.currentUser;
      const currentUser = currentUserSubject && typeof currentUserSubject.getValue === 'function'
        ? currentUserSubject.getValue()
        : currentUserSubject?.value ?? currentUserSubject;
      if (currentUser && currentUser.uid === idUsuario) {
        return {
          nombre: currentUser.displayName || currentUser.email?.split('@')[0] || 'Mi perfil',
          email: currentUser.email || '',
          nombreCompleto: currentUser.displayName || 'Mi perfil'
        };
      }

      // Método 3: Intentar desde el backend con endpoint de usuarios
      try {
        const token = await this.authService.getIdToken();
        const headers = new HttpHeaders()
          .set('Authorization', `Bearer ${token}`)
          .set('Content-Type', 'application/json');

        // Intentar diferentes endpoints comunes para obtener usuario
        const posiblesEndpoints = [
          `http://localhost:8080/api/users/${idUsuario}`,
          `http://localhost:8080/api/usuarios/${idUsuario}`,
          `http://localhost:8080/api/user/${idUsuario}`,
          `http://localhost:8080/api/auth/user/${idUsuario}`,
          `http://localhost:8080/api/users/getUser/${idUsuario}`,
          `http://localhost:8080/api/users/admin/getUser/${idUsuario}`
        ];

        for (const endpoint of posiblesEndpoints) {
          try {
            console.log(`🔍 Intentando endpoint: ${endpoint}`);
            const userData = await firstValueFrom(
              this.http.get<any>(endpoint, { headers })
            );
            
            if (userData) {
              console.log('✅ Usuario obtenido desde backend:', userData);
              return this.procesarDatosUsuario(userData);
            }
          } catch (endpointError: any) {
            console.log(`❌ Endpoint ${endpoint} falló:`, endpointError.status);
            // Continuar con el siguiente endpoint
          }
        }
      } catch (error) {
        console.log('🔍 Método backend falló, intentando Firebase...');
      }

      // Método 4: Intentar desde Firebase Realtime Database directamente
      try {
        const userData = await this.obtenerUsuarioDesdeFirebaseRealtime(idUsuario);
        if (userData) {
          return userData;
        }
      } catch (error) {
        console.log('🔍 Firebase Realtime Database falló:', error);
      }

      // Método 5: Intentar con AuthService si existe
      try {
        if (this.authService.getUserData && typeof this.authService.getUserData === 'function') {
          const userData = await this.authService.getUserData(idUsuario);
          if (userData) {
            return this.procesarDatosUsuario(userData);
          }
        }
      } catch (error) {
        console.log('🔍 AuthService falló:', error);
      }

      // Fallback: Crear nombre amigable basado en el ID
      const nombreAmigable = this.crearNombreAmigable(idUsuario);
      
      return {
        nombre: nombreAmigable,
        email: 'Email no disponible',
        nombreCompleto: nombreAmigable
      };

    } catch (error) {
      console.error('❌ Error completo obteniendo usuario:', error);
      return {
        nombre: this.crearNombreAmigable(idUsuario),
        email: 'Error al cargar',
        nombreCompleto: this.crearNombreAmigable(idUsuario)
      };
    }
  }

  // Crear un nombre más amigable que solo mostrar el ID
  private crearNombreAmigable(idUsuario: string): string {
    if (!idUsuario) return 'Usuario desconocido';
    
    // Si el ID parece ser un email, extraer la parte antes del @
    if (idUsuario.includes('@')) {
      return idUsuario.split('@')[0];
    }
    
    // Si es muy largo, tomar los primeros y últimos caracteres
    if (idUsuario.length > 16) {
      return `Usuario_${idUsuario.substring(0, 4)}...${idUsuario.substring(idUsuario.length - 4)}`;
    }
    
    // Si es corto, mostrar como "Usuario_xxx"
    return `Usuario_${idUsuario.substring(0, 8)}`;
  }

  // Obtener usuario desde Firebase Realtime Database
  private async obtenerUsuarioDesdeFirebaseRealtime(idUsuario: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔍 Buscando usuario en Firebase Realtime Database:', idUsuario);
        
        // Importar Firebase Database dinámicamente
        import('firebase/database').then(({ getDatabase, ref, get }) => {
          const database = getDatabase();
          const userRef = ref(database, `users/${idUsuario}`);
          
          get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.val();
              console.log('✅ Usuario encontrado en Firebase:', userData);
              resolve(this.procesarDatosUsuario(userData));
            } else {
              console.log('⚠️ Usuario no encontrado en Firebase Database');
              reject(new Error('Usuario no encontrado'));
            }
          }).catch((error) => {
            console.error('❌ Error leyendo Firebase Database:', error);
            reject(error);
          });
        }).catch((error) => {
          console.error('❌ Error importando Firebase Database:', error);
          reject(error);
        });
      } catch (error) {
        console.error('❌ Error configurando Firebase Database:', error);
        reject(error);
      }
    });
  }

  // Procesar datos de usuario con todos los campos posibles
  private procesarDatosUsuario(userData: any): any {
    if (!userData) {
      return { nombre: 'Sin datos', email: '', nombreCompleto: '' };
    }

    console.log('🔍 Procesando userData:', userData);
    console.log('🔍 Claves disponibles:', Object.keys(userData));
    
    // Lista exhaustiva de posibles campos para nombre
    const camposNombre = [
      userData.nombre,
      userData.nombreCompleto,
      userData.nombreUsuario,
      userData.displayName,
      userData.name,
      userData.firstName,
      userData.first_name,
      userData.username,
      userData.usuario,
      userData.user_name,
      userData.fullName,
      userData.full_name,
      // Campos anidados
      userData.profile?.nombre,
      userData.profile?.name,
      userData.user?.nombre,
      userData.user?.name,
      userData.data?.nombre,
      userData.data?.name
    ].filter(campo => campo && typeof campo === 'string' && campo.trim() !== '');

    // Lista exhaustiva de posibles campos para email
    const camposEmail = [
      userData.email,
      userData.correo,
      userData.emailAddress,
      userData.email_address,
      userData.mail,
      // Campos anidados
      userData.profile?.email,
      userData.user?.email,
      userData.data?.email
    ].filter(campo => campo && typeof campo === 'string' && campo.includes('@'));

    const nombre = camposNombre[0] || 'Sin nombre';
    const email = camposEmail[0] || '';

    console.log('✅ Datos procesados:', {
      nombresEncontrados: camposNombre,
      emailsEncontrados: camposEmail,
      nombreFinal: nombre,
      emailFinal: email
    });

    return {
      nombre: nombre,
      email: email,
      nombreCompleto: nombre
    };
  }

  // Obtener información de los días de la semana
  private async obtenerInfoDiasSemana(idsDias: string[]): Promise<any[]> {
    try {
      if (!idsDias || idsDias.length === 0) {
        return [];
      }

      const diasInfo = await Promise.all(
        idsDias.map(async (idDia) => {
          try {
            const diaInfo = await this.diaSemanaService.getDiaById(idDia);
            return {
              id: idDia,
              nombre: diaInfo?.recomendacionesDelDia || `Día ${diaInfo?.dia_semana}`,
              dia_semana: diaInfo?.dia_semana || 'Desconocido',
              fechaDia: diaInfo?.fechaDia || ''
            };
          } catch (error) {
            console.error(`Error obteniendo día ${idDia}:`, error);
            return {
              id: idDia,
              nombre: 'Día desconocido',
              dia_semana: 'Desconocido',
              fechaDia: ''
            };
          }
        })
      );

      return diasInfo;
    } catch (error) {
      console.error('Error obteniendo info días semana:', error);
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

  // Método para obtener un plan ENRIQUECIDO por ID
  async getPlanEnriquecidoById(id: string): Promise<PlanSemanaEnriquecido | null> {
    try {
      const planBasico = await this.getPlanById(id);
      if (!planBasico) {
        return null;
      }
      
      return await this.enriquecerPlan(planBasico);
    } catch (error) {
      console.error(`Error al obtener el plan enriquecido con ID ${id}:`, error);
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

  // Método para obtener los planes de un usuario específico ENRIQUECIDOS
  async getMisPlanesUsuarioEnriquecidos(idUsuario: string): Promise<PlanSemanaEnriquecido[]> {
    try {
      const planesBasicos = await this.getMisPlanesUsuario(idUsuario);
      
      if (planesBasicos.length === 0) {
        return [];
      }

      const planesEnriquecidos = await Promise.all(
        planesBasicos.map(plan => this.enriquecerPlan(plan))
      );

      return planesEnriquecidos;
    } catch (error) {
      console.error(`Error al obtener los planes enriquecidos del usuario ${idUsuario}:`, error);
      return [];
    }
  }

  // Método para obtener los planes de un usuario específico - ORIGINAL
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

  // MÉTODOS HELPER PARA EL FRONTEND
  contarDias(plan: PlanSemanaEnriquecido): number {
    return plan.totalDias || plan.diasSemana?.length || 0;
  }

  getDiasSemanaFormateados(plan: PlanSemanaEnriquecido): string {
    return plan.nombresDias || 'Sin días configurados';
  }

  getNombreUsuario(plan: PlanSemanaEnriquecido): string {
    return plan.usuario?.nombre || 'Usuario desconocido';
  }

  // MÉTODO DE DEBUG TEMPORAL
  async debugAuthService() {
    console.log('🔍 DEBUGGING AuthService:');
    console.log('🔍 AuthService object:', this.authService);
    console.log('🔍 AuthService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.authService)));
    console.log('🔍 AuthService properties:', Object.keys(this.authService));
    
    // Verificar métodos específicos
    const metodosComunes = [
      'getUserData',
      'getUserInfo', 
      'getUser',
      'getUserById',
      'getCurrentUser',
      'getAuthUser',
      'fetchUserData'
    ];
    
    console.log('🔍 Métodos disponibles:');
    metodosComunes.forEach(metodo => {
      const disponible = typeof (this.authService as any)[metodo] === 'function';
      console.log(`  - ${metodo}: ${disponible ? '✅' : '❌'}`);
    });
    
    // Verificar si hay propiedades relacionadas con usuarios
    console.log('🔍 Propiedades relacionadas con usuarios:');
    Object.keys(this.authService).forEach(prop => {
      if (prop.toLowerCase().includes('user')) {
        console.log(`  - ${prop}:`, typeof (this.authService as any)[prop]);
      }
    });
  }

  // MÉTODO DE PRUEBA PARA ENDPOINTS
  async probarObtenerUsuario(idUsuarioPrueba?: string) {
    const idUsuario = idUsuarioPrueba || "dLu5BrURVzXR3pfIEdpnswdhhut1";
    
    console.log('🧪 PRUEBA: Obteniendo datos de usuario para:', idUsuario);
    
    try {
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');

      const endpoints = [
        `http://localhost:8080/api/users/${idUsuario}`,
        `http://localhost:8080/api/usuarios/${idUsuario}`,
        `http://localhost:8080/api/user/${idUsuario}`,
        `http://localhost:8080/api/auth/user/${idUsuario}`,
        `http://localhost:8080/api/users/getUser/${idUsuario}`,
        `http://localhost:8080/api/users/admin/getUser/${idUsuario}`
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Probando endpoint: ${endpoint}`);
          const response = await firstValueFrom(
            this.http.get<any>(endpoint, { headers })
          );
          console.log(`✅ ÉXITO con ${endpoint}:`, response);
          return { endpoint, data: response };
        } catch (error: any) {
          console.log(`❌ ${endpoint} falló:`, error.status, error.message);
        }
      }

      console.log('❌ Ningún endpoint de backend funcionó');
      return null;

    } catch (error) {
      console.error('❌ Error en prueba de usuario:', error);
      return null;
    }
  }

  // MÉTODO PARA AGREGAR USUARIOS CONOCIDOS
  agregarUsuarioConocido(idUsuario: string, nombre: string, email: string) {
    this.usuariosConocidos[idUsuario] = { nombre, email };
    console.log(`✅ Usuario agregado a tabla conocidos: ${nombre} (${idUsuario})`);
  }
}