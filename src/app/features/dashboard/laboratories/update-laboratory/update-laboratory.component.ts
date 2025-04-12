import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-update-laboratory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './update-laboratory.component.html',
  styleUrls: ['./update-laboratory.component.scss'],
})
export class UpdateLaboratoryComponent {
  lugares = ['Bloque A', 'Bloque B', 'Edificio Central'];

  // Fake DB
  private fakeLabs: any = {
    '1': {
      nombre: 'Laboratorio de Física',
      descripcion: 'Laboratorio para pruebas de movimiento',
      lugar: 'Bloque A',
      disponibilidad: true,
    },
    '2': {
      nombre: 'Laboratorio de Química',
      descripcion: 'Reactivos y experimentos',
      lugar: 'Bloque B',
      disponibilidad: false,
    },
  };

  labForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    lugar: ['', Validators.required],
    disponibilidad: ['true', Validators.required],
  });

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID laboratorio a editar:', id);

    const data = this.fakeLabs[id ?? ''];
    if (data) this.setLabData(data);
    else console.warn('Laboratorio no encontrado');
  }

  setLabData(lab: any): void {
    this.labForm.patchValue({
      nombre: lab.nombre,
      descripcion: lab.descripcion,
      lugar: lab.lugar,
      disponibilidad: lab.disponibilidad.toString(),
    });
  }

  onSubmit(): void {
    if (this.labForm.valid) {
      const formData = {
        ...this.labForm.value,
        disponibilidad: this.labForm.value.disponibilidad === 'true',
      };
      console.log('Cambios guardados:', formData);
      // Aquí puedes llamar a un servicio
    }
  }

  onCancel(): void {
    this.labForm.reset({ disponibilidad: 'true' });
  }
}
