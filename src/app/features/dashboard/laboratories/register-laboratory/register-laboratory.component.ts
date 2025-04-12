import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-register-laboratory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register-laboratory.component.html',
  styleUrls: ['./register-laboratory.component.scss'],
})
export class RegisterLaboratoryComponent {
  lugares = [
    { id: 1, nombre: 'Bloque A' },
    { id: 2, nombre: 'Bloque B' },
    { id: 3, nombre: 'Edificio Central' },
  ];

  labForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    lugarId: ['', Validators.required],
    disponibilidad: [true, Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.labForm.valid) {
      const formData = this.labForm.value;
      console.log('Laboratorio registrado:', formData);
      // Aquí iría la lógica para enviarlo al backend
    }
  }

  onCancel() {
    this.labForm.reset({ disponibilidad: true });
  }
}
