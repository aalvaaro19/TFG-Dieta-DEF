import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Receta } from '../../interface/receta';
import { RecetaService } from '../../service/receta.service';

@Component({
  selector: 'app-formulario-recetas',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './formulario-recetas.component.html',
  styleUrls: ['./formulario-recetas.component.scss']
})
export class FormularioRecetasComponent implements OnInit {
  receta: Receta = {
    id_receta: '',
    nombre: '',
    descripcion: '',
    ingredientes: [],
    cantidades: [],  // Agregar campo para cantidades
    calorias: '',
    cantidad_carbohidratos: '',
    cantidad_proteinas: '',
    cantidad_grasas: '',
    tiempo_preparacion: '',
    dificultad: 'Fácil',
    imagen: ''
  };

  ingredientesInput: string = '';
  cantidadesInput: string = '';  // Campo para las cantidades
  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarMensaje: boolean = false;

  constructor(private recetaService: RecetaService) { }

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  onSubmit(): void {
    // Convertir el string de ingredientes y cantidades en arrays
    this.receta.ingredientes = this.ingredientesInput
      .split(',')
      .map(ingrediente => ingrediente.trim())
      .filter(ingrediente => ingrediente !== '');
    
    this.receta.cantidades = this.cantidadesInput
      .split(',')
      .map(cantidad => cantidad.trim())
      .filter(cantidad => cantidad !== '');

    // Verificar si los ingredientes y cantidades tienen la misma longitud
    if (this.receta.ingredientes.length !== this.receta.cantidades.length) {
      this.mostrarMensaje = true;
      this.mensajeError = 'El número de ingredientes no coincide con el número de cantidades.';
      this.mensajeExito = '';
      return;
    }

    // Llamar al servicio para guardar la receta
    this.recetaService.createReceta(this.receta).subscribe({
      next: () => {
        this.mostrarMensaje = true;
        this.mensajeExito = 'Receta guardada exitosamente';
        this.mensajeError = '';
        this.limpiarFormulario();
        setTimeout(() => {
          this.mostrarMensaje = false;
        }, 3000);
      },
      error: (error) => {
        this.mostrarMensaje = true;
        this.mensajeExito = '';
        this.mensajeError = 'Error al guardar la receta: ' + (error.message || 'Error desconocido');
        console.error('Error al guardar la receta:', error);
        setTimeout(() => {
          this.mostrarMensaje = false;
        }, 3000);
      }
    });
  }

  limpiarFormulario(): void {
    this.receta = {
      id_receta: '',
      nombre: '',
      descripcion: '',
      ingredientes: [],
      cantidades: [],  // Limpiar las cantidades
      calorias: '',
      cantidad_carbohidratos: '',
      cantidad_proteinas: '',
      cantidad_grasas: '',
      tiempo_preparacion: '',
      dificultad: 'Fácil',
      imagen: ''
    };
    this.ingredientesInput = '';
    this.cantidadesInput = '';  // Limpiar el campo de cantidades
  }
}
