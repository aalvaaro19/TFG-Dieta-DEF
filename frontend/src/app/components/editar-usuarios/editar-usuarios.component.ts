import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-editar-usuarios',
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-usuarios.component.html',
  styleUrl: './editar-usuarios.component.scss'
})
export class EditarUsuariosComponent implements OnInit {
  usuarioRegistrado: any = null;
  user: any = {}; // Inicializar user vacío
  auth: Auth = inject(Auth);


  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.usuarioRegistrado = user;
        console.log('Usuario autenticado:', user);
  
        const userId = this.route.snapshot.paramMap.get('id');
        if (userId) {
          this.getUserById(userId);
        }
      } else {
        console.error('Usuario no autenticado');
        this.router.navigate(['/login']);
      }
    });
  }
  

  async getUserById(id: string) {
    const token = await this.usuarioRegistrado.getIdToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    try {
      // Change the parameter name from id_usuario to uid to match the backend
      this.user = await firstValueFrom(this.http.get<any>(`http://localhost:8080/api/admin/users/getUserById?uid=${id}`, { headers }));
      console.log('Usuario obtenido:', this.user);
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      
      // If you get a 403 error, try using the non-admin endpoint
      if ((error as any).status === 403) {
        try {
          // Use the regular user profile endpoint which doesn't require ADMIN role
          this.user = await firstValueFrom(this.http.get<any>(`http://localhost:8080/api/users/profile/${id}`, { headers }));
          console.log('Usuario obtenido usando endpoint público:', this.user);
        } catch (secondError) {
          console.error('Error al obtener el usuario con endpoint público:', secondError);
        }
      }
    }
  }
  
  async editarUsuario() {
    try {
      const token = await this.usuarioRegistrado.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      // Use the correct endpoint from your UserController
      await firstValueFrom(this.http.put(
        `http://localhost:8080/api/users/update/${this.user.id_usuario}`, 
        null,
        { 
          headers,
          params: {
            nombreUsuario: this.user.nombreUsuario,
            nombreCompleto: this.user.nombreCompleto,
            telefono: this.user.telefono,
            email: this.user.email,
            password: this.user.password,
            direccion: this.user.direccion,
            peso: this.user.peso,
            altura: this.user.altura,
            sexo: this.user.sexo,
            edad: this.user.edad,
            objetivo: this.user.objetivo,
            imagen: this.user.imagen
          }
        }
      ));
      
      console.log('Usuario actualizado');
      this.location.back(); // Regresa a la página anterior
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    }
  }
}
