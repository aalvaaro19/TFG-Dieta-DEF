import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';  // Importar el Auth de Firebase
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-carta-personal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carta-personal.component.html',
  styleUrl: './carta-personal.component.scss'
})
export class CartaPersonalComponent implements OnInit {
  users: any[] = [];
  isLoggedIn: boolean = false;
  usuario: User | null = null;
  
  // Variables para el modal
  mostrarModal: boolean = false;
  usuarioModal: any = null;

  constructor(
    private auth: Auth,  // Para verificar el estado de autenticación
    private router: Router,
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  ngOnInit(){
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.usuario = user;
        this.isLoggedIn = true;
        // Solo obtendremos los usuarios si estamos autenticados
        this.users = await this.getUsers(user);
        console.log('Usuarios obtenidos:', this.users);  // Solo para depurar
      } else {
        console.error('Usuario no autenticado');
        this.isLoggedIn = false;
      }
    });
  }

  // Función para obtener los usuarios usando el token del usuario autenticado
  async getUsers(user: User): Promise<any[]> {
    try {
      const token = await user.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      console.log('Headers:', headers);
      // Realizamos la solicitud HTTP para obtener los usuarios
      return await firstValueFrom(this.http.get<any[]>('http://localhost:8080/api/admin/users/getAllUsers', { headers }));
    } catch (error) {
      const errorMessage = (error as any).message || error;
      console.error('Error al obtener los usuarios:', errorMessage);
      return [];
    }
  }

  // Función para gestionar el logout
  async logout() {
    await this.auth.signOut();
    console.log('Sesión cerrada');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);  // Redirigir al login
  }

  // Función para alternar entre login y logout
  async toggleAuth() {
    if (this.isLoggedIn) {
      console.log('Usuario ya está autenticado, cerrando sesión');
      this.logout();
    } else {
      console.log('Usuario no autenticado, redirigiendo al login');
      this.router.navigate(['/login']);
    }
  }

  updateUser(usuarioSeleccionado: any) {
    if (usuarioSeleccionado?.id_usuario) {
      console.log('Actualizando usuario:', usuarioSeleccionado);
      this.router.navigate(['/editar-usuario/', usuarioSeleccionado.id_usuario]);
    } else {
      console.error('Usuario no definido o sin ID:', usuarioSeleccionado);
    }
  }

  async deleteUser(usuarioSeleccionado: any) {
  // Validar que el usuario tenga ID
  if (!usuarioSeleccionado?.id_usuario && !usuarioSeleccionado?.uid) {
    console.error('Usuario no definido o sin ID:', usuarioSeleccionado);
    alert('Error: Usuario no válido para eliminar');
    return;
  }

    try {
      // Obtener información del usuario actual para debug - CORREGIDO
      const currentUser = await this.authService.getCurrentUser(); // Usar método público
      console.log('🔍 Usuario actual (Firebase):', {
        uid: currentUser?.uid,
        email: currentUser?.email,
        emailVerified: currentUser?.emailVerified
      });

      // Verificar que hay un usuario autenticado
      if (!currentUser) {
        alert('No hay usuario autenticado. Por favor, inicia sesión.');
        return;
      }

      // Verificar que no se esté intentando eliminar a sí mismo
      const currentUserId = currentUser.uid;
      const targetUserId = usuarioSeleccionado.id_usuario || usuarioSeleccionado.uid;
      
      console.log('🔍 IDs comparados:', {
        currentUserId,
        targetUserId,
        areEqual: currentUserId === targetUserId
      });

      // Comentado porque algunos sistemas permiten auto-eliminación
      // if (currentUserId === targetUserId) {
      //   alert('No puedes eliminarte a ti mismo');
      //   return;
      // }

      // Confirmar la eliminación
      const userName = usuarioSeleccionado.nombre || usuarioSeleccionado.nombreCompleto || usuarioSeleccionado.email || 'Usuario desconocido';
      const confirmed = confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"?\n\nEsta acción no se puede deshacer.`);
      
      if (!confirmed) {
        return;
      }

      console.log('🔍 Eliminando usuario:', usuarioSeleccionado);

      // Obtener token actualizado con información de debug
      console.log('🔍 Obteniendo token...');
      const token = await this.authService.getIdToken();
      
      // Verificar que el token se obtenga correctamente
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación');
      }
      
      console.log('🔍 Token obtenido:', {
        length: token.length,
        starts: token.substring(0, 20) + '...',
        ends: '...' + token.substring(token.length - 20),
        parts: token.split('.').length // Verificar que sea un JWT válido
      });

      // Preparar headers con debug
      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');

      console.log('🔍 Headers preparados:', {
        'Authorization': `Bearer ${token.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      });

      // URL de la petición
      const deleteUrl = `http://localhost:8080/api/users/delete/${targetUserId}`;
      console.log('🔍 URL de eliminación:', deleteUrl);

      // Realizar la petición DELETE con más información de debug
      console.log('🔍 Enviando petición DELETE...');
      const response = await firstValueFrom(
        this.http.delete(deleteUrl, { 
          headers,
          observe: 'response' // Para obtener toda la respuesta HTTP
        })
      );

      console.log('✅ Usuario eliminado exitosamente:', response);
      
      // Actualizar la lista de usuarios después de eliminar
      this.users = this.users.filter(user => {
        const userId = user.id_usuario || user.uid;
        return userId !== targetUserId;
      });
      
      alert('Usuario eliminado exitosamente');

    } catch (error: any) {
      console.error('❌ Error completo al eliminar usuario:', error);
      
      // Debug completo del error
      console.log('🔍 Detalles del error:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        url: error.url,
        error: error.error,
        headers: error.headers?.keys?.() || 'No headers',
        fullError: error // Para ver todo el objeto de error
      });

      let errorMessage = 'Error desconocido al eliminar el usuario';
      
      // Manejar diferentes tipos de errores HTTP
      if (error.status) {
        switch (error.status) {
          case 401:
            errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente';
            console.log('🔍 Sugerencia: El token podría estar expirado o ser inválido');
            break;
          case 403:
            errorMessage = 'No tienes permisos suficientes para eliminar este usuario';
            console.log('🔍 Sugerencias para error 403:');
            console.log('- Verifica que el token esté llegando correctamente al backend');
            console.log('- Revisa las reglas de seguridad en tu backend');
            console.log('- Confirma que el usuario tenga los permisos necesarios');
            console.log('- Verifica que el endpoint no requiera rol específico');
            
            // Intentar obtener información adicional del token
            try {
              const tokenValue = await this.authService.getIdToken();
              if (tokenValue) {
                const tokenPayload = this.parseJWT(tokenValue);
                console.log('🔍 Payload del token:', tokenPayload);
              } else {
                console.log('🔍 No se pudo obtener el token para decodificar');
              }
            } catch (e) {
              console.log('🔍 No se pudo decodificar el token:', e);
            }
            break;
          case 404:
            errorMessage = 'Usuario no encontrado en el servidor';
            break;
          case 409:
            errorMessage = 'No se puede eliminar el usuario porque tiene datos asociados';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Inténtalo más tarde';
            break;
          default:
            errorMessage = `Error del servidor (${error.status}): ${error.statusText || 'Error desconocido'}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error al eliminar usuario: ${errorMessage}`);
    }
  }

  // Método auxiliar para decodificar JWT (solo para debug)
  parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parseando JWT:', e);
      return null;
    }
  }

  async crearChat(usuarioSeleccionado: any) {
    if (usuarioSeleccionado?.id_usuario) {
      console.log('Creando chat con:', usuarioSeleccionado);
      const token = await this.authService.getIdToken();
      console.log('Usuario autenticado:', this.usuario?.email, 'Token:', token);
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      const chatData = {
        sender: this.usuario?.uid,  // El usuario actual
        receiver: usuarioSeleccionado.id_usuario,  // El usuario seleccionado
        mensajes: [],
        read: false,
        text: '¡Hola! ¿Cómo estás?',
        timestamp: new Date().getTime()
      };
  
      try {
        const chat = await firstValueFrom(this.http.post<any>('http://localhost:8080/api/chat/crearChat', chatData, { headers }));
        console.log('Chat creado:', chat, 'con:', usuarioSeleccionado, 'y usuario actual:', this.usuario);
      } catch (error) {
        console.error('Error al crear el chat:', error);
      }
    } else {
      console.error('Usuario no definido o sin ID:', usuarioSeleccionado);
    }
  }
  
  // Método para mostrar el modal con los detalles del usuario
  mostrarDetallesUsuario(usuarioSeleccionado: any): void {
    this.usuarioModal = usuarioSeleccionado;
    this.mostrarModal = true;
    // Prevenir el scroll en el body mientras el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  // Método para cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuarioModal = null;
    // Restaurar el scroll en el body
    document.body.style.overflow = 'auto';
  }

  // Método para obtener la URL de la imagen del usuario
  obtenerUrlImagen(usuario: any): string {
    if (!usuario.imagen) {
      return 'assets/images/default-user.jpg'; // Imagen por defecto
    }
    
    // Si es una URL, devolverla directamente
    if (usuario.imagen.startsWith('http://') || usuario.imagen.startsWith('https://')) {
      return usuario.imagen;
    }
    
    // Si no, devolver la ruta local
    return `../../../images/${usuario.imagen}.jpg`;
  }

  // Método para calcular el IMC del usuario
  calcularIMC(peso: number, altura: number): number {
    // Altura en metros (si viene en cm)
    const alturaMetros = altura >= 3 ? altura / 100 : altura;
    return +(peso / (alturaMetros * alturaMetros)).toFixed(2);
  }

  // Método para interpretar el IMC
  interpretarIMC(imc: number): { texto: string, clase: string } {
    if (imc < 18.5) {
      return { texto: 'Bajo peso', clase: 'text-blue-600 bg-blue-100' };
    } else if (imc >= 18.5 && imc < 25) {
      return { texto: 'Peso normal', clase: 'text-green-600 bg-green-100' };
    } else if (imc >= 25 && imc < 30) {
      return { texto: 'Sobrepeso', clase: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { texto: 'Obesidad', clase: 'text-red-600 bg-red-100' };
    }
  }
}