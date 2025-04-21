import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { DropdownSearchComponent } from '../../../../shared/components/dropdown-search/dropdown-search.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-register-laboratory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UppercaseDirective,
    DropdownSearchComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './register-laboratory.component.html',
  styleUrls: ['./register-laboratory.component.scss'],
})
export class RegisterLaboratoryComponent {
  // Lista de ubicaciones disponibles
  locationOptions: string[] = [
    'Bloque A',
    'Bloque B',
    'Edificio Central',
    'Laboratorio de Física',
    'Sala de Computo',
  ];

  selectedLocation: string | null = null;
  showConfirmationModal = false;

  // Formulario reactivo
  labForm = this.fb.group({
    labName: ['', Validators.required],
    description: ['', Validators.required],
    locationName: ['', Validators.required],
    availability: [true, Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  // Autoajuste de altura para textarea
  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // Seleccionar ubicación desde dropdown reutilizable
  onSelectLocation(option: string): void {
    this.selectedLocation = option;
    this.labForm.patchValue({ locationName: option });
  }

  // Enviar formulario
  submitForm(): void {
    if (this.labForm.valid) {
      this.showConfirmationModal = true;
    }
  }

  // Confirmar desde el modal
  confirmSubmit(): void {
    console.log('Laboratorio registrado:', this.labForm.value);
    this.resetForm();
    this.showConfirmationModal = false;
  }

  // Resetear todo
  resetForm(): void {
    this.labForm.reset({ availability: true });
    this.selectedLocation = null;
  }

  // Cancelar modal
  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  // Texto de disponibilidad formateado
  get availabilityText(): string {
    return this.labForm.value.availability ? 'Sí' : 'No';
  }
}
