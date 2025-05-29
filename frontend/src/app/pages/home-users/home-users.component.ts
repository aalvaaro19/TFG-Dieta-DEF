import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PerfilComponent } from "../../components/users/perfil/perfil.component";
import { ListadoPlanesSemanalesComponent } from "../../components/users/listado-planes-semanales/listado-planes-semanales.component";
import { ListadoProgresosComponent } from "../../components/users/listado-progresos/listado-progresos.component";

@Component({
  selector: 'app-home-users',
  imports: [CommonModule, PerfilComponent, ListadoPlanesSemanalesComponent, ListadoProgresosComponent],
  templateUrl: './home-users.component.html',
  styleUrls: ['./home-users.component.css']
})
export class HomeUsersComponent implements OnInit {
  user: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    const userProfile = await this.authService.getUserProfileFromBackend();
    if (userProfile) {
      this.user = userProfile;
      this.isLoggedIn = true;
      console.log('Datos completos del usuario:', this.user);
    } else {
      this.isLoggedIn = false;
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
    this.activeComponent = 'listadoPlanesSemanales';
  }

  goToProgresos() {
    this.activeComponent = 'listadoProgresos';
  }

  goToPerfil() {
    this.activeComponent = 'perfil';
  }

  handleRegisterButton() {
    console.log('Redirigiendo al formulario de progreso');
    this.router.navigate(['/formularioProgreso']);
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
}
