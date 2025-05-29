import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listado-planes-semanales',
  imports: [CommonModule],
  templateUrl: './listado-planes-semanales.component.html',
  styleUrl: './listado-planes-semanales.component.scss'
})
export class ListadoPlanesSemanalesComponent implements OnInit {
  planes: any[] = [];
  recetas: any[] = [];
  diasSemana: any[] = [];
  diaSeleccionado: string = ''; // Día seleccionado global
  ordenDias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  constructor(private authService: AuthService, private http: HttpClient) {}

  async ngOnInit() {
    const userProfile = await this.authService.getUserProfileFromBackend();
    if (userProfile && userProfile.id_usuario) {
      await Promise.all([
        this.cargarPlanesUsuario(userProfile.id_usuario),
        this.cargarRecetas(),
        this.cargarDiasSemana()
      ]);
      // Selecciona el primer día por defecto cuando se cargan los días
      this.cargarDiasSemana().then(() => {
        if (this.diasSemana.length > 0) {
          this.diaSeleccionado = this.diasSemana[0].dia_semana;
        }
      });
    }
  }

  async cargarPlanesUsuario(id_usuario: string) {
    try {
      const user = await this.authService.getCurrentUser();
      const token = user ? await user.getIdToken() : null;

      const response = await this.http.get<any[]>(
        `http://localhost:8080/api/planes-semana/users/getMisPlanes/${id_usuario}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      ).toPromise();

      this.planes = response || [];
    } catch (error) {
      console.error('Error al cargar los planes semanales:', error);
    }
  }

  async cargarRecetas() {
    try {
      const user = await this.authService.getCurrentUser();
      const token = user ? await user.getIdToken() : null;

      const response = await this.http.get<any[]>(
        `http://localhost:8080/api/recetas/getAllRecetas`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      ).toPromise();

      this.recetas = response || [];
    } catch (error) {
      console.error('Error al cargar las recetas:', error);
    }
  }

  async cargarDiasSemana() {
    try {
      const user = await this.authService.getCurrentUser();
      const token = user ? await user.getIdToken() : null;

      const response = await this.http.get<any[]>(
        `http://localhost:8080/api/dias-semana/getAllDias`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      ).toPromise();

      this.diasSemana = (response || []).sort(
        (a, b) => this.ordenDias.indexOf(a.dia_semana) - this.ordenDias.indexOf(b.dia_semana)
      );
    } catch (error) {
      console.error('Error al cargar los días de la semana:', error);
    }
  }

  // Cambia el día seleccionado
  seleccionarDia(dia_semana: string) {
    this.diaSeleccionado = dia_semana;
  }
}

