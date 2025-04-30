import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { DropdownSearchAddableComponent } from '../../../../shared/components/dropdown-search-addable/dropdown-search-addable.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-register-laboratory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UppercaseDirective,
    DropdownSearchAddableComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './register-laboratory.component.html',
  styleUrls: ['./register-laboratory.component.scss'],
})
export class RegisterLaboratoryComponent {
  labForm: FormGroup;
  availableLocations: string[] = ['Bloque A', 'Bloque B', 'Sala de Cómputo'];
  selectedLocation: string | null = null;
  showConfirmationModal = false;
  notesRequired = false;

  constructor(private fb: FormBuilder) {
    this.labForm = this.fb.group({
      labName: ['', Validators.required],
      description: ['', Validators.required],
      locationName: ['', Validators.required],
      status: ['', Validators.required],
      notes: [''],
    });
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  onSelectLocation(option: string): void {
    this.selectedLocation = option;
    this.labForm.get('locationName')?.setValue(option);
  }

  onStatusChange(): void {
    const status = this.labForm.get('status')?.value;
    this.notesRequired = status === 'INACTIVO';

    const notesControl = this.labForm.get('notes');
    if (this.notesRequired) {
      notesControl?.setValidators([Validators.required]);
    } else {
      notesControl?.clearValidators();
    }
    notesControl?.updateValueAndValidity();
  }

  submitForm(): void {
    if (this.labForm.valid) {
      this.showConfirmationModal = true;
    }
  }

  confirmSubmit(): void {
    console.log('Laboratorio registrado:', this.labForm.value);
    this.resetForm();
    this.showConfirmationModal = false;
  }

  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  resetForm(): void {
    this.labForm.reset({ status: '', notes: '' });
    this.selectedLocation = null;
    this.notesRequired = false;
  }
}
