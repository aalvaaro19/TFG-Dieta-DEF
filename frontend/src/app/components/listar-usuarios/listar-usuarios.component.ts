import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CartaPersonalComponent } from "../carta-personal/carta-personal.component";
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { FormularioRecetasComponent } from "../formulario-recetas/formulario-recetas.component";
import { PaginaRecetasComponent } from "../../pages/pagina-recetas/pagina-recetas.component";
import { ProgresoComponent } from "../progreso/progreso.component";
import { ProgresoWidgetComponent } from '../progreso-widget/progreso-widget.component';

@Component({
  selector: 'app-listar-usuarios',
  imports: [CommonModule, CartaPersonalComponent, FormularioRecetasComponent, PaginaRecetasComponent, ProgresoComponent, ProgresoWidgetComponent],
  templateUrl: './listar-usuarios.component.html',
  styleUrl: './listar-usuarios.component.scss'
})
export class ListarUsuariosComponent {
user: any;
  
  constructor(private authService: AuthService, private router: Router, private http: HttpClient) { }


  logout() {
    this.authService.logOut();
    console.log('Sesión cerrada');
    this.router.navigate(['/login']);
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
 

}
