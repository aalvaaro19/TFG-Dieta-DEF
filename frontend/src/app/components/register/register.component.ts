import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  usuarioRegistrado: any = null;

  user = {
    nombreUsuario: '',
    nombreCompleto: '',
    telefono: '',
    direccion: '',
    email: '',
    password: '',
    peso: 0,
    altura: 0,
    sexo: '',
    edad: 0,
    objetivo: ''
  }

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) { }

  async registerWithEmailAndPassword() {
    try {
      const userCredential = await this.authService.createUserWithEmailAndPassword(this.user.email, this.user.password);
      console.log('Usuario creado con éxito:', userCredential);

      const uid = userCredential.user.uid;

      const newUser = {
        id_usuario: uid,
        email: this.user.email,
        password: this.user.password,
        nombreUsuario: this.user.nombreUsuario,
        nombreCompleto: this.user.nombreCompleto,
        telefono: this.user.telefono,
        direccion: this.user.direccion,
        peso: this.user.peso,
        altura: this.user.altura,
        sexo: this.user.sexo,
        edad: this.user.edad,
        objetivo: this.user.objetivo
      };
  
      this.http.post('http://localhost:8080/api/users/createUser', newUser)
        .subscribe(response => {
          console.log('Usuario guardado correctamente en Realtime Database', response);
          this.router.navigate(['/login']);
        }, error => {
          console.error('Error al guardar usuario en Realtime Database', error);
        });
  
    } catch (error) {
      console.error('Error al crear el usuario:', error);
    }
  }
}
