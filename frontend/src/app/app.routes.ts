import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ListarUsuariosComponent } from './components/listar-usuarios/listar-usuarios.component';
import { CartaPersonalComponent } from './components/carta-personal/carta-personal.component';
import { EditarUsuariosComponent } from './components/editar-usuarios/editar-usuarios.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'listarUsuarios', component: ListarUsuariosComponent },
  { path: 'carta-personal', component: CartaPersonalComponent }, 
  { path: 'editar-usuario', component: EditarUsuariosComponent }
];
