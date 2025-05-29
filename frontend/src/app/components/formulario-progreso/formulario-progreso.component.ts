import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { ProgresoService } from '../../service/progreso.service';
import { AuthService } from '../../service/auth.service';
import { Progreso } from '../../interface/progreso';

@Component({
  selector: 'app-formulario-progreso',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-progreso.component.html',
  styleUrl: './formulario-progreso.component.scss'
})
export class FormularioProgresoComponent implements OnInit {
  progresoForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  userId: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private progresoService: ProgresoService,
    private authService: AuthService,
    private router: Router, 
    private location: Location
  ) {
    this.progresoForm = this.formBuilder.group({
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      peso: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      masaGrasa: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      masaMuscular: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      pecho: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      cintura: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      cadera: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      abdomen: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      brazoDerecho: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      piernaDerecha: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    });
  }

  ngOnInit(): void {
    this.getCurrentUser();
  }

  async getCurrentUser() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.userId = user.uid;
    } else {
      this.error = 'Debes iniciar sesión para registrar tu progreso';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  onSubmit() {
    if (this.progresoForm.invalid) {
      this.error = 'Por favor, completa correctamente todos los campos';
      return;
    }

    if (!this.userId) {
      this.error = 'Error de autenticación. Inicia sesión nuevamente';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formValues = this.progresoForm.value;
    
    const newProgreso: Progreso = {
      id_progreso: '',
      id_usuario: this.userId,
      fecha: formValues.fecha,
      peso: formValues.peso,
      masaGrasa: formValues.masaGrasa,
      masaMuscular: formValues.masaMuscular,
      pecho: formValues.pecho,
      cintura: formValues.cintura,
      cadera: formValues.cadera,
      abdomen: formValues.abdomen,
      brazoDerecho: formValues.brazoDerecho,
      piernaDerecha: formValues.piernaDerecha
    };

    this.progresoService.createProgreso(newProgreso).subscribe({
      next: () => {
        this.loading = false;
        this.success = '¡Progreso registrado con éxito!';
        this.resetForm();
        
        // Redirigir después de un breve tiempo
        setTimeout(() => {
          this.location.back();
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al guardar el progreso: ' + (err.message || 'Intenta nuevamente');
        console.error('Error saving progress:', err);
      }
    });
  }

  resetForm() {
    this.progresoForm.reset({
      fecha: new Date().toISOString().split('T')[0]
    });
  }

  cancelar() {
    this.router.navigate(['/mis-progresos']);
  }
}
