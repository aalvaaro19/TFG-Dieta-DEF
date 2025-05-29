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
        await this.authService.getIdToken();
        // Obtener el rol del usuario usando el AuthService
        const role = await this.authService.getUserRole();
        if (role === 'ADMIN') {
          this.router.navigate(['/homeTrainer']);
        } else if (role === 'USER') {
          this.router.navigate(['/homeUsers']);
        } else {
          // Redirección por defecto o manejo de error
          this.router.navigate(['/']);
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }

  async loginWithGoogle() {
    try {
      const user = await this.authService.loginWithGoogle();
      if (user) {
        // Obtener el rol del usuario usando el AuthService
        const role = await this.authService.getUserRole();
        if (role === 'ADMIN') {
          this.router.navigate(['/homeTrainers']);
        } else if (role === 'USER') {
          this.router.navigate(['/homeUsers']);
        } else {
          this.router.navigate(['/']);
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  }

  async logout() {
    await this.authService.logOut();
    console.log('Sesión cerrada');
  }
}