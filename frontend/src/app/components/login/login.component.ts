import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) { }

  async loginWithEmailAndPassword(email: string, password: string) {
    try {
      const user = await this.authService.loginWithEmailAndPassword(email, password);
      if (user) {
        // Asegurar que tenemos un token fresco antes de navegar
        await this.authService.getIdToken();
        console.log('Usuario autenticado:', user);
        this.router.navigate(['/listarUsuarios']);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }

  async loginWithGoogle() {
    try {
      const user = await this.authService.loginWithGoogle();
      console.log('Usuario autenticado con Google:', user);
      this.router.navigate(['/listarUsuarios']);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  }

  async logout() {
    await this.authService.logOut();
    console.log('Sesión cerrada');
  }
}
