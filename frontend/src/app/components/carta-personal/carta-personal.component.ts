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
    if (usuarioSeleccionado?.id_usuario) {
      console.log('Eliminando usuario:', usuarioSeleccionado);
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      try {
        await firstValueFrom(this.http.delete(`http://localhost:8080/api/users/delete/${usuarioSeleccionado.id_usuario}`, { headers }));
        console.log('Usuario eliminado:', usuarioSeleccionado);
        // Actualizar la lista de usuarios después de eliminar uno
        this.users = this.users.filter(user => user.id_usuario !== usuarioSeleccionado.id_usuario);
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
      }
    } else {
      console.error('Usuario no definido o sin ID:', usuarioSeleccionado);
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