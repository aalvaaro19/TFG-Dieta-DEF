import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DiaSemana } from '../../interface/dia-semana';
import { DiaSemanaService } from '../../service/dia-semana.service';

@Component({
  selector: 'app-listar-dias-semana',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './listar-dias-semana.component.html',
  styleUrl: './listar-dias-semana.component.scss'
})
export class ListarDiasSemanaComponent implements OnInit {
  dias: DiaSemana[] = [];
  diasFiltrados: DiaSemana[] = [];
  cargando = true;
  error: string | null = null;
  
  // Filtros
  filtroFecha: string = '';
  filtroDiaSemana: string = '';
  filtroEstado: string = '';
  
  // Ordenamiento
  ordenActual: string = 'fecha';
  ordenAscendente: boolean = true;

  constructor(private diaSemanaService: DiaSemanaService) { }

  async ngOnInit() {
    await this.cargarDias();
  }

  async cargarDias() {
    try {
      this.cargando = true;
      this.error = null;
      this.dias = await this.diaSemanaService.getAllDias();
      this.aplicarFiltros();
      this.ordenarDias();
      this.cargando = false;
    } catch (error) {
      this.cargando = false;
      this.error = 'Error al cargar los días de la semana';
      console.error('Error al cargar los días:', error);
    }
  }

  async eliminarDia(id: string) {
    if (confirm('¿Está seguro que desea eliminar este día?')) {
      try {
        const resultado = await this.diaSemanaService.deleteDia(id);
        if (resultado) {
          this.dias = this.dias.filter(dia => dia.id_diaSemana !== id);
          this.aplicarFiltros();
          this.ordenarDias();
          alert('Día eliminado correctamente');
        } else {
          alert('No se pudo eliminar el día');
        }
      } catch (error) {
        console.error('Error al eliminar día:', error);
        alert('Error al eliminar el día');
      }
    }
  }

  aplicarFiltros() {
    this.diasFiltrados = this.dias.filter(dia => {
      // Filtrar por fecha
      const cumpleFecha = !this.filtroFecha || 
                          dia.fechaDia?.includes(this.filtroFecha);
      
      // Filtrar por día de la semana
      const cumpleDiaSemana = !this.filtroDiaSemana || 
                             dia.dia_semana === this.filtroDiaSemana;
      
      // Filtrar por estado
      const cumpleEstado = !this.filtroEstado || 
                          dia.estadoDia === this.filtroEstado;
      
      return cumpleFecha && cumpleDiaSemana && cumpleEstado;
    });
  }

  ordenarDias() {
    this.diasFiltrados.sort((a, b) => {
      let valorA, valorB;
      
      // Determinar qué valores comparar según el campo de ordenamiento
      switch (this.ordenActual) {
        case 'fecha':
          valorA = a.fechaDia || '';
          valorB = b.fechaDia || '';
          break;
        case 'diaSemana':
          valorA = a.dia_semana || '';
          valorB = b.dia_semana || '';
          break;
        case 'estado':
          valorA = a.estadoDia || '';
          valorB = b.estadoDia || '';
          break;
        case 'calorias':
          valorA = a.objetivoCaloriasDelDia || 0;
          valorB = b.objetivoCaloriasDelDia || 0;
          break;
        default:
          valorA = a.fechaDia || '';
          valorB = b.fechaDia || '';
      }
      
      // Realizar la comparación en el orden correcto
      if (this.ordenAscendente) {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });
  }

  cambiarOrden(campo: string) {
    if (this.ordenActual === campo) {
      // Si ya estamos ordenando por este campo, invertir el orden
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      // Si es un nuevo campo de ordenamiento, establecerlo y ordenar ascendente
      this.ordenActual = campo;
      this.ordenAscendente = true;
    }
    this.ordenarDias();
  }

  onFiltroChange() {
    this.aplicarFiltros();
    this.ordenarDias();
  }

  limpiarFiltros() {
    this.filtroFecha = '';
    this.filtroDiaSemana = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
    this.ordenarDias();
  }

  async refrescarLista() {
    await this.cargarDias();
  }
  
  contarRecetas(dia: DiaSemana): number {
    return dia.receta?.length || 0;
  }
  
  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}