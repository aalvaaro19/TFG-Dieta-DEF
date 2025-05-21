import { Component, OnInit } from '@angular/core';
import { Receta } from '../../interface/receta';
import { RecetaService } from '../../service/receta.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-pagina-recetas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagina-recetas.component.html',
  styleUrls: ['./pagina-recetas.component.scss']
})
export class PaginaRecetasComponent implements OnInit {
  recetas: Receta[] = [];
  loading: boolean = true;
  error: string | null = null;
  selectedReceta: Receta | null = null;
  
  // Variables para el modal
  mostrarModal: boolean = false;
  recetaModal: Receta | null = null;

  constructor(
    private recetaService: RecetaService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthAndLoadRecetas();
  }

  checkAuthAndLoadRecetas(): void {
    this.loading = true;
    this.error = null;

    this.authService.getIdToken()
      .then(token => {
        if (token) {
          this.loadRecetas();
        } else {
          this.setError('No estás autenticado. Inicia sesión primero.');
        }
      })
      .catch(err => {
        this.setError('Error al verificar autenticación: ' + err.message);
      });
  }

  loadRecetas(): void {
    this.recetaService.getRecetasByToken() 
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (recetas: Receta[]) => {
          this.recetas = recetas;
        },
        error: (err) => {
          this.setError('Error al cargar las recetas: ' + err.message);
        }
      });
  }

  seleccionarReceta(receta: Receta): void {
    this.selectedReceta = receta;
  }

  irADetalle(recetaId: string): void {
    this.router.navigate(['/recetas', recetaId]);
  }

  private setError(message: string): void {
    this.error = message;
    this.loading = false;
  }

  editarReceta(id: string): void {
    this.router.navigate(['/recetas/editar', id]);
  }

  deleteReceta(recetaId: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta receta?')) return;
  
    this.recetaService.deleteReceta(recetaId)
      .subscribe({
        next: () => {
          this.recetas = this.recetas.filter(r => r.id_receta !== recetaId);
        },
        error: (err) => {
          this.setError('Error al eliminar la receta: ' + err.message);
        }
      });
  }

  // Método actualizado para mostrar el modal con los detalles de la receta
  mostrarDetallesReceta(receta: Receta): void {
    this.recetaModal = receta;
    this.mostrarModal = true;
    // Prevenir el scroll en el body mientras el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  // Método para cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.recetaModal = null;
    // Restaurar el scroll en el body
    document.body.style.overflow = 'auto';
  }

  // Método para formatear los ingredientes como lista
  formatearIngredientes(ingredientes: string[] | null): string {
    if (!ingredientes || ingredientes.length === 0) {
      return 'No hay ingredientes registrados';
    }
    return ingredientes.join(', ');
  }

  // Método para determinar si una imagen es una URL o una ruta local
  esImagenUrl(rutaImagen: string): boolean {
    return typeof rutaImagen === 'string' && (rutaImagen.startsWith('http://') || rutaImagen.startsWith('https://'));
  }

  // Método para obtener la URL de la imagen
  obtenerUrlImagen(receta: Receta): string {
    if (!receta.imagen) {
      return 'assets/images/default-recipe.jpg'; // Imagen por defecto
    }
    
    // Si es una URL, devolverla directamente
    if (this.esImagenUrl(receta.imagen)) {
      return receta.imagen;
    }
    
    // Si no, devolver la ruta local
    return `../../../images/${receta.imagen}.jpg`;
  }
}