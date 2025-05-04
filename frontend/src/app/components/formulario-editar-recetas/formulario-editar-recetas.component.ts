import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecetaService } from '../../service/receta.service';
import { Receta } from '../../interface/receta';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-editar-receta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-editar-recetas.component.html',
  styleUrl: './formulario-editar-recetas.component.scss'
})
export class FormularioEditarRecetasComponent implements OnInit {
  recetaForm!: FormGroup;
  recetaId: string = '';
  loading: boolean = false;
  submitted: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private recetaService: RecetaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.recetaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.recetaId) {
      this.loadReceta();
    } else {
      this.errorMessage = 'ID de receta no proporcionado';
      setTimeout(() => {
        this.router.navigate(['/recetas']);
      }, 3000);
    }
  }

  initForm(): void {
    this.recetaForm = this.fb.group({
      id_receta: [''],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.required],
      ingredientes: this.fb.array([]),
      cantidades: this.fb.array([]),
      calorias: [''],
      cantidad_carbohidratos: [''],
      cantidad_proteinas: [''],
      cantidad_grasas: [''],
      tiempo_preparacion: [''],
      dificultad: [''],
      imagen: ['']
    });
  }

  loadReceta(): void {
    this.loading = true;
    this.errorMessage = '';

    this.recetaService.getRecetaById(this.recetaId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (receta) => {
          if (receta) {
            this.updateForm(receta);
          } else {
            this.errorMessage = `No se encontró la receta con ID: ${this.recetaId}`;
          }
        },
        error: (error) => {
          console.error('Error loading recipe:', error);
          this.errorMessage = 'No se pudo cargar la receta. Por favor, inténtalo de nuevo.';
        }
      });
  }

  updateForm(receta: Receta): void {
    // Clear existing form arrays
    this.ingredientes.clear();
    this.cantidades.clear();

    // Add ingredients and quantities
    if (receta.ingredientes && receta.ingredientes.length > 0) {
      receta.ingredientes.forEach((ingrediente, index) => {
        this.addIngrediente(ingrediente);
        const cantidad = receta.cantidades && index < receta.cantidades.length 
          ? receta.cantidades[index] 
          : '';
        this.addCantidad(cantidad);
      });
    } else {
      this.addIngredienteRow();
    }

    // Patch other values
    this.recetaForm.patchValue({
      id_receta: receta.id_receta,
      nombre: receta.nombre,
      descripcion: receta.descripcion,
      calorias: receta.calorias || '',
      cantidad_carbohidratos: receta.cantidad_carbohidratos || '',
      cantidad_proteinas: receta.cantidad_proteinas || '',
      cantidad_grasas: receta.cantidad_grasas || '',
      tiempo_preparacion: receta.tiempo_preparacion || '',
      dificultad: receta.dificultad || '',
      imagen: receta.imagen || ''
    });
  }

  get ingredientes(): FormArray {
    return this.recetaForm.get('ingredientes') as FormArray;
  }

  get cantidades(): FormArray {
    return this.recetaForm.get('cantidades') as FormArray;
  }

  addIngrediente(value: string = ''): void {
    this.ingredientes.push(this.fb.control(value, Validators.required));
  }

  addCantidad(value: string = ''): void {
    this.cantidades.push(this.fb.control(value));
  }

  removeIngrediente(index: number): void {
    if (this.ingredientes.length > 1) {
      this.ingredientes.removeAt(index);
      this.cantidades.removeAt(index);
    } else {
      this.ingredientes.at(0).setValue('');
      this.cantidades.at(0).setValue('');
    }
  }

  addIngredienteRow(): void {
    this.addIngrediente();
    this.addCantidad();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.recetaForm.invalid) {
      Object.keys(this.recetaForm.controls).forEach(key => {
        const control = this.recetaForm.get(key);
        control?.markAsTouched();
      });

      for (let i = 0; i < this.ingredientes.length; i++) {
        this.ingredientes.at(i).markAsTouched();
      }

      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const recetaData: Receta = this.recetaForm.value;

    this.recetaService.updateReceta(recetaData)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.router.navigate(['/recetas']);
        },
        error: (error) => {
          console.error('Error updating recipe:', error);
          this.errorMessage = 'No se pudo actualizar la receta. Por favor, inténtalo de nuevo.';
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/listarUsuarios']);
  }
}
