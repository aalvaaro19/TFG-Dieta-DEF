import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';  // Importar el Auth de Firebase
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

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

  constructor(
    private auth: Auth,  // Para verificar el estado de autenticación
    private router: Router,
    private http: HttpClient
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
}
