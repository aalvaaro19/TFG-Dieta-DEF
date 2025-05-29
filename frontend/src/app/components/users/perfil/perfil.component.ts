import { Component } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent {
  user: any = null;
  usuario: User | null = null;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient ) {}

  async ngOnInit() {
    const userProfile = await this.authService.getUserProfileFromBackend();
    if (userProfile) {
      this.user = userProfile;
      console.log('Datos completos del usuario:', this.user);
    } else {
      this.router.navigate(['/login']);
    }
  }

    logout() {
      this.authService.logOut();
      this.router.navigate(['/login']);
    }

  isLoggedIn: boolean = false;
  activeComponent: string = 'perfil';

  toggleAuth() {
    if (this.isLoggedIn) {
      this.isLoggedIn = false;
      this.activeComponent = '';
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToPlanesSemanales() {
    this.activeComponent = 'planesSemanales';
  }

  goToProgresos() {
    this.activeComponent = 'progresos';
  }

  goToPerfil() {
    this.activeComponent = 'perfil';
  }

  handleRegisterButton() {
    switch (this.activeComponent) {
      case 'perfil':
        this.router.navigate(['/perfil']);
        break;
      case 'planesSemanales':
        this.router.navigate(['/formularioPlanesSemanales']);
        break;
      case 'progresos':
        this.router.navigate(['/formularioProgreso']);
        break;
      default:
        break;
    }
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
        this.router.navigate(['/login']);
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
}
