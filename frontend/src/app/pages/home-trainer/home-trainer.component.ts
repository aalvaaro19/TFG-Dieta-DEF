import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartaPersonalComponent } from "../../components/carta-personal/carta-personal.component";
import { PaginaRecetasComponent } from "../pagina-recetas/pagina-recetas.component";
import { ListarDiasSemanaComponent } from "../../components/listar-dias-semana/listar-dias-semana.component";
import { ListarProgresoComponent } from "../../components/listar-progreso/listar-progreso.component";
import { CommonModule } from '@angular/common';
import { PlanesSemanalesComponent } from '../../components/listar-planes-semanales/listar-planes-semanales.component';

@Component({
  selector: 'app-home-trainer',
  imports: [CartaPersonalComponent, PaginaRecetasComponent, PlanesSemanalesComponent, ListarDiasSemanaComponent, ListarProgresoComponent, CommonModule],
  templateUrl: './home-trainer.component.html',
  styleUrl: './home-trainer.component.scss'
})
export class HomeTrainerComponent implements OnInit {
  isLoggedIn: boolean = false;
  activeComponent: string = 'clientes';

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLogin();
  }

  checkLogin() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  toggleAuth() {
    if (this.isLoggedIn) {
      localStorage.removeItem('token');
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

  goToPlanesDiarios() {
    this.activeComponent = 'planesDiarios';
  }

  goToRecetas() {
    this.activeComponent = 'recetas';
  }

  goToRegisterUser() {
    this.activeComponent = 'registro';
  }

  goToProgresos() {
    this.activeComponent = 'progresos';
  }
  goToClientes() {
    this.activeComponent = 'clientes';
  }

  handleRegisterButton() {
    switch (this.activeComponent) {
      case 'clientes':
        this.router.navigate(['/register']);
        break;
      case 'recetas':
        this.router.navigate(['/formularioRecetas']);
        break;
      case 'planesDiarios':
        this.router.navigate(['/formularioPlanesDiarios']);
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

}
