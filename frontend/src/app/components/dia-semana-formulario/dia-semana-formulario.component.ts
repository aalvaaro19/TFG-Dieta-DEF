import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { DiaSemana, DiasSemana } from '../../interface/dia-semana';
import { Receta } from '../../interface/receta';
import { DiaSemanaService } from '../../service/dia-semana.service';
import { RecetaService } from '../../service/receta.service';

@Component({
  selector: 'app-dia-semana-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './dia-semana-formulario.component.html',
  styleUrl: './dia-semana-formulario.component.scss'
})
export class DiaSemanaFormularioComponent implements OnInit {
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

  diasSemana = Object.values(DiasSemana);
  recetasDisponibles: Receta[] = [];
  recetasSeleccionadas: Receta[] = [];
  modoEdicion = false;
  idDia: string | null = null;

  constructor(
    private diaSemanaService: DiaSemanaService,
    private recetaService: RecetaService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    // Cargar recetas disponibles
    try {
      this.recetaService.getAllRecetas().subscribe(
        recetas => this.recetasDisponibles = recetas,
        error => console.error('Error al cargar recetas:', error)
      );
    } catch (error) {
      console.error('Error al cargar recetas:', error);
    }

    // Verificar si estamos en modo edición
    this.route.paramMap.subscribe(async params => {
      this.idDia = params.get('id');
      if (this.idDia) {
        this.modoEdicion = true;
        try {
          const diaExistente = await this.diaSemanaService.getDiaById(this.idDia);
          if (diaExistente) {
            this.dia = diaExistente;
            this.recetasSeleccionadas = diaExistente.receta || [];
          }
        } catch (error) {
          console.error('Error al cargar día existente:', error);
        }
      }
    });
  }

  async guardarDia() {
    try {
      // Asignar recetas seleccionadas
      this.dia.receta = this.recetasSeleccionadas;
      
      let resultado = false;
      if (this.modoEdicion && this.idDia) {
        // Actualizar día existente
        resultado = await this.diaSemanaService.updateDia(this.dia);
      } else {
        // Crear nuevo día
        const saveResult = await this.diaSemanaService.saveDia(this.dia);
        resultado = saveResult !== null && saveResult !== undefined;
      }

      if (resultado) {
        alert('Día guardado correctamente');
        this.router.navigate(['/dias-semana']);
      } else {
        alert('Error al guardar el día');
      }
    } catch (error) {
      console.error('Error al guardar día:', error);
      alert('Error al guardar el día: ' + error);
    }
  }

  agregarReceta(receta: Receta) {
    if (!this.recetasSeleccionadas.some(r => r.id_receta === receta.id_receta)) {
      this.recetasSeleccionadas.push(receta);
    }
  }

  quitarReceta(indice: number) {
    this.recetasSeleccionadas.splice(indice, 1);
  }

  cancelar() {
    this.router.navigate(['/dias-semana']);
  }
}
