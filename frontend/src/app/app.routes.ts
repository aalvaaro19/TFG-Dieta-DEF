import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ListarUsuariosComponent } from './components/listar-usuarios/listar-usuarios.component';
import { CartaPersonalComponent } from './components/carta-personal/carta-personal.component';
import { EditarUsuariosComponent } from './components/editar-usuarios/editar-usuarios.component';
import { PaginaChatComponent } from './pages/pagina-chat/pagina-chat.component';
import { PaginaChatIndividualComponent } from './pages/pagina-chat-individual/pagina-chat-individual.component';
import { FormularioEditarRecetasComponent } from './components/formulario-editar-recetas/formulario-editar-recetas.component';
import { FormularioProgresoComponent } from './components/formulario-progreso/formulario-progreso.component';
import { FormularioEditarDiasSemanaComponent } from './components/formulario-editar-dias-semana/formulario-editar-dias-semana.component';
import { FormularioEditarPlanesSemanalesComponent } from './components/formulario-editar-planes-semanales/formulario-editar-planes-semanales.component';
import { HomeTrainerComponent } from './pages/home-trainer/home-trainer.component';
import { FormularioCrearPlanesSemanalesComponent } from './components/formulario-crear-planes-semanales/formulario-crear-planes-semanales.component';
import { DiaSemanaFormularioComponent } from './components/dia-semana-formulario/dia-semana-formulario.component';
import { FormularioRecetasComponent } from './components/formulario-recetas/formulario-recetas.component';
import { HomeUsersComponent } from './pages/home-users/home-users.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'listarUsuarios', component: ListarUsuariosComponent },
  { path: 'carta-personal', component: CartaPersonalComponent },
  { path: 'editar-usuario/:id', component: EditarUsuariosComponent },
  { path: 'paginaChats',  component: PaginaChatComponent },
  { path: 'paginaChatIndividual', component: PaginaChatIndividualComponent},
  { path: 'recetas/editar/:id', component: FormularioEditarRecetasComponent },
  { path: 'formularioProgreso', component: FormularioProgresoComponent },
  { path: 'formularioEditarDiaSemana/:id', component: FormularioEditarDiasSemanaComponent },
  { path: 'formularioEditaPlanesSemanales/:id', component: FormularioEditarPlanesSemanalesComponent },
  { path: 'homeTrainer', component: HomeTrainerComponent },
  { path: 'homeUsers', component: HomeUsersComponent },
  { path: 'formularioPlanesSemanales', component: FormularioCrearPlanesSemanalesComponent }, 
  { path: 'formularioPlanesDiarios', component: DiaSemanaFormularioComponent},
  { path: 'formularioRecetas', component: FormularioRecetasComponent }
];
