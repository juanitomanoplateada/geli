import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-equipment-pattern',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register-equipment-pattern.component.html',
  styleUrls: ['./register-equipment-pattern.component.scss'],
})
export class RegisterEquipmentPatternComponent {
  laboratorios = [
    { id: 1, nombre: 'Laboratorio de Redes' },
    { id: 2, nombre: 'Laboratorio de Electrónica' },
  ];

  funciones = [
    { id: 1, nombre: 'Procesamiento de datos' },
    { id: 2, nombre: 'Control de dispositivos' },
  ];

  equipmentForm = this.fb.group({
    nombre: ['', Validators.required],
    marca: ['', Validators.required],
    numeroInventario: ['', Validators.required],
    ubicacionLaboratorio: ['', Validators.required],
    disponibilidad: [true, Validators.required],
    idFuncion: ['', Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.equipmentForm.valid) {
      const formData = this.equipmentForm.value;
      console.log('Patrón de equipo registrado:', formData);
    }
  }

  onCancel() {
    this.equipmentForm.reset({ disponibilidad: true });
  }
}
