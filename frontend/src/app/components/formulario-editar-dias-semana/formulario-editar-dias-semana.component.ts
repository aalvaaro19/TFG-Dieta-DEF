import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { DiaSemana, DiasSemana } from '../../interface/dia-semana';
import { Receta } from '../../interface/receta';
import { DiaSemanaService } from '../../service/dia-semana.service';
import { RecetaService } from '../../service/receta.service';

@Component({
  selector: 'app-formulario-editar-dias-semana',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './formulario-editar-dias-semana.component.html',
  styleUrl: './formulario-editar-dias-semana.component.scss'
})
export class FormularioEditarDiasSemanaComponent implements OnInit {
  // Modelo para el día de la semana
  dia: DiaSemana = {
    dia_semana: DiasSemana.LUNES,
    receta: [],
    objetivoCaloriasDelDia: 0,
    objetivoProteinasDelDia: 0,
    objetivoCarbohidratosDelDia: 0,
    objetivoGrasasDelDia: 0,
    numeroComidasDia: 3,
    recomendacionesDelDia: '',
    fechaDia: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    estadoDia: 'PENDIENTE'
  };

  // Propiedades para el modo edición
  modoEdicion = false;
  idDia: string | null = null;
  
  // Propiedades para las recetas
  recetasDisponibles: Receta[] = [];
  recetasSeleccionadas: Receta[] = [];
  
  // Enum para los días de la semana
  diasSemana = Object.values(DiasSemana);
  
  // Estados del componente
  cargando = false;
  guardando = false;
  errorCarga: string | null = null;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(
    private diaSemanaService: DiaSemanaService,
    private recetaService: RecetaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.cargando = true;
    
    try {
      // Paso 1: Cargar las recetas disponibles
      await this.cargarRecetas();
      
      // Paso 2: Verificar si estamos en modo edición
      this.route.paramMap.subscribe(async params => {
        this.idDia = params.get('id');
        
        if (this.idDia) {
          this.modoEdicion = true;
          await this.cargarDia(this.idDia);
        }
      });
    } catch (error) {
      console.error('Error durante la inicialización:', error);
      this.errorCarga = 'Ocurrió un error al cargar los datos necesarios.';
    } finally {
      this.cargando = false;
    }
  }

  async cargarRecetas() {
    try {
      this.recetaService.getAllRecetas().subscribe(
        recetas => this.recetasDisponibles = recetas,
        error => console.error('Error al cargar recetas:', error)
      );
    } catch (error) {
      console.error('Error al cargar recetas:', error);
    }
  }

  async cargarDia(id: string) {
    try {
      console.log(`Cargando día con ID: ${id}`);
      const diaData = await this.diaSemanaService.getDiaById(id);
      
      if (diaData) {
        console.log('Día encontrado:', diaData);
        this.dia = diaData;
        
        // Inicializar recetas seleccionadas
        this.recetasSeleccionadas = diaData.receta || [];
        
        // Convertir valores al tipo correcto si es necesario
        if (typeof this.dia.objetivoCaloriasDelDia !== 'number') {
          this.dia.objetivoCaloriasDelDia = Number(this.dia.objetivoCaloriasDelDia) || 0;
        }
        if (typeof this.dia.objetivoProteinasDelDia !== 'number') {
          this.dia.objetivoProteinasDelDia = Number(this.dia.objetivoProteinasDelDia) || 0;
        }
        if (typeof this.dia.objetivoCarbohidratosDelDia !== 'number') {
          this.dia.objetivoCarbohidratosDelDia = Number(this.dia.objetivoCarbohidratosDelDia) || 0;
        }
        if (typeof this.dia.objetivoGrasasDelDia !== 'number') {
          this.dia.objetivoGrasasDelDia = Number(this.dia.objetivoGrasasDelDia) || 0;
        }
        if (typeof this.dia.numeroComidasDia !== 'number') {
          this.dia.numeroComidasDia = Number(this.dia.numeroComidasDia) || 3;
        }
      } else {
        console.error(`No se encontró el día con ID: ${id}`);
        this.errorCarga = `No se encontró el día con ID: ${id}`;
      }
    } catch (error) {
      console.error(`Error al cargar día ${id}:`, error);
      this.errorCarga = 'Error al cargar los datos del día seleccionado';
    }
  }

  async guardarDia() {
    this.guardando = true;
    this.mensajeExito = null;
    this.mensajeError = null;
    
    try {
      // Asignar las recetas seleccionadas al día
      this.dia.receta = this.recetasSeleccionadas;
      
      let resultado: string | boolean | null;
      
      if (this.modoEdicion && this.idDia) {
        // Asegurar que el ID está asignado para actualización
        this.dia.id_diaSemana = this.idDia;
        resultado = await this.diaSemanaService.updateDia(this.dia);
        
        if (resultado) {
          this.mensajeExito = 'Día actualizado correctamente';
          setTimeout(() => this.router.navigate(['/dias-semana-lista']), 1500);
        } else {
          this.mensajeError = 'Error al actualizar el día';
        }
      } else {
        // Crear nuevo día
        resultado = await this.diaSemanaService.saveDia(this.dia);
        
        if (resultado) {
          this.mensajeExito = `Día creado correctamente con ID: ${resultado}`;
          setTimeout(() => this.router.navigate(['/dias-semana-lista']), 1500);
        } else {
          this.mensajeError = 'Error al crear el día';
        }
      }
    } catch (error) {
      console.error('Error al guardar día:', error);
      this.mensajeError = `Error al guardar: ${error}`;
    } finally {
      this.guardando = false;
    }
  }

  agregarReceta(receta: Receta) {
    // Verificar si la receta ya está en las seleccionadas
    if (!this.recetasSeleccionadas.some(r => r.id_receta === receta.id_receta)) {
      this.recetasSeleccionadas.push(receta);
    }
  }

  quitarReceta(indice: number) {
    if (indice >= 0 && indice < this.recetasSeleccionadas.length) {
      this.recetasSeleccionadas.splice(indice, 1);
    }
  }

  cancelar() {
    this.router.navigate(['/dias-semana-lista']);
  }

  // Método para filtrar las recetas disponibles (mostrar solo las que no están seleccionadas)
  get recetasDisponiblesFiltradas(): Receta[] {
    if (!this.recetasSeleccionadas.length) return this.recetasDisponibles;
    
    return this.recetasDisponibles.filter(recetaDisp => 
      !this.recetasSeleccionadas.some(recetaSel => 
        recetaSel.id_receta === recetaDisp.id_receta
      )
    );
  }
}