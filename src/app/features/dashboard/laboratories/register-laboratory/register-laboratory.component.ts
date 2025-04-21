import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';

@Component({
  selector: 'app-register-laboratory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UppercaseDirective],
  templateUrl: './register-laboratory.component.html',
  styleUrls: ['./register-laboratory.component.scss'],
})
export class RegisterLaboratoryComponent {
  availableLocations = [
    { id: 1, name: 'Bloque A' },
    { id: 2, name: 'Bloque B' },
    { id: 3, name: 'Edificio Central' },
    { id: 4, name: 'Laboratorio de Física' },
    { id: 5, name: 'Sala de Computo' },
  ];

  filteredLocations = [...this.availableLocations];
  locationSearchTerm = '';
  selectedLocationName = 'Seleccione un lugar';
  showLocationDropdown = false;
  showConfirmationModal = false;

  labForm = this.fb.group({
    labName: ['', Validators.required],
    description: ['', Validators.required],
    locationId: ['', Validators.required],
    availability: [true, Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // reset
    textarea.style.height = textarea.scrollHeight + 'px'; // expand to content
  }

  toggleLocationDropdown(): void {
    this.showLocationDropdown = !this.showLocationDropdown;
    if (this.showLocationDropdown) {
      this.filterLocations('');
    }
  }

  filterLocations(term: string): void {
    const search = term.toLowerCase();
    this.filteredLocations = this.availableLocations.filter((l) =>
      l.name.toLowerCase().includes(search)
    );
  }

  selectLocation(location: any): void {
    this.labForm.patchValue({ locationId: location.id });
    this.selectedLocationName = location.name;
    this.showLocationDropdown = false;
  }

  submitForm(): void {
    if (this.labForm.valid) {
      this.showConfirmationModal = true;
    }
  }

  confirmSubmit(): void {
    console.log('Laboratorio registrado:', this.labForm.value);
    // Aquí iría la lógica de backend...
    this.labForm.reset({ availability: true });
    this.selectedLocationName = 'Seleccione un lugar';
    this.showConfirmationModal = false;
  }

  resetForm(): void {
    this.labForm.reset({ availability: true });
    this.selectedLocationName = 'Seleccione un lugar';
    this.locationSearchTerm = '';
  }
}
