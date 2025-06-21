import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { DropdownSearchEntityComponent } from '../../../../shared/components/dropdown-search-entity/dropdown-search-entity.component';

import { LaboratoryService } from '../../../../core/services/laboratory/laboratory.service';
import { LocationService } from '../../../../core/services/location/location.service';
import { LaboratoryResponseDto } from '../../../../core/dto/laboratory/laboratory-response.dto';
import { LocationDto } from '../../../../core/dto/location/location-response.dto';
import { InputRulesDirective } from '../../../../shared/directives/input-rules/input-rules';

@Component({
  selector: 'app-register-laboratory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputRulesDirective,
    ConfirmModalComponent,
    DropdownSearchEntityComponent,
  ],
  templateUrl: './register-laboratory.component.html',
  styleUrls: ['./register-laboratory.component.scss'],
})
export class RegisterLaboratoryComponent implements OnInit {
  labForm: FormGroup;
  availableLocations: {
    label: string;
    value: { id: number; locationName: string };
  }[] = [];
  selectedLocation: { id: number; locationName: string } | null = null;
  proposedLocationName: string | null = null;

  showConfirmationModal = false;
  notesRequired = false;
  isSubmitting = false;
  modalFeedbackMessage = '';
  modalFeedbackSuccess = false;
  showModalFeedback = false;

  labNameAlreadyExists = false;
  labNameChecking = false;

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private laboratoryService: LaboratoryService
  ) {
    this.labForm = this.fb.group({
      labName: ['', Validators.required],
      locationName: ['', Validators.required],
      status: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.loadLocations();
    this.labForm.get('labName')?.valueChanges.subscribe((value) => {
      this.checkIfLabNameExists(value);
    });
  }

  private checkIfLabNameExists(name: string | null): void {
    if (!name || typeof name !== 'string') {
      this.labNameAlreadyExists = false;
      return;
    }

    const trimmed = name.trim().toUpperCase();
    if (!trimmed) {
      this.labNameAlreadyExists = false;
      return;
    }

    this.labNameChecking = true;

    this.laboratoryService.existsByName(trimmed).subscribe({
      next: (exists: boolean) => {
        this.labNameAlreadyExists = exists;
        this.labNameChecking = false;
      },
      error: () => {
        this.labNameAlreadyExists = false;
        this.labNameChecking = false;
      },
    });
  }

  private loadLocations(): void {
    this.locationService.getAll().subscribe({
      next: (locations) => {
        if (!locations) {
          this.availableLocations = [];
          return;
        }
        this.availableLocations = locations.map((l) => ({
          label: l.locationName,
          value: { id: l.id, locationName: l.locationName },
        }));
      },
      error: (err) => {
        console.error('Error cargando ubicaciones:', err);
      },
    });
  }

  onSelectLocation(location: { id: number; locationName: string }): void {
    this.selectedLocation = location;
    this.proposedLocationName = null;
    this.labForm.get('locationName')?.setValue(location.locationName);
  }

  onProposedLocation(name: string): void {
    this.proposedLocationName = name.trim().toUpperCase();
    this.selectedLocation = null;
    this.labForm.get('locationName')?.setValue(this.proposedLocationName);
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
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    const form = this.labForm.value;
    const locationName = form.locationName.trim().toUpperCase();

    const existing = this.availableLocations.find(
      (opt) => opt.label.toUpperCase() === locationName
    );

    const finalizeRegistration = (location: {
      id: number;
      locationName: string;
    }) => {
      const payload: LaboratoryResponseDto = {
        laboratoryName: form.labName,
        laboratoryDescription: form.description,
        location: {
          id: location.id,
          locationName: location.locationName,
        },
        laboratoryAvailability: form.status === 'ACTIVO',
        laboratoryObservations: form.notes || '',
      };

      this.laboratoryService.createLaboratory(payload).subscribe({
        next: () => {
          this.modalFeedback('✅ Laboratorio registrado exitosamente.', true);
          setTimeout(() => {
            this.resetForm();
            this.showConfirmationModal = false;
            this.isSubmitting = false;
          }, 4000);
        },
        error: () => {
          this.modalFeedback('❌ Error al registrar laboratorio.', false);
          this.isSubmitting = false;
        },
      });
    };

    if (existing) {
      finalizeRegistration(existing.value);
    } else if (this.proposedLocationName) {
      this.locationService
        .create({ locationName: this.proposedLocationName })
        .subscribe({
          next: (newLocation) => {
            finalizeRegistration({
              id: newLocation.id,
              locationName: newLocation.locationName,
            });
          },
          error: () => {
            this.modalFeedback('❌ Error al crear ubicación.', false);
            this.isSubmitting = false;
          },
        });
    } else {
      this.modalFeedback('❌ Ubicación inválida o no seleccionada.', false);
      this.isSubmitting = false;
    }
  }

  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  resetForm(): void {
    this.labForm.reset({ status: '', notes: '' });
    this.selectedLocation = null;
    this.proposedLocationName = null;
    this.notesRequired = false;
    this.isSubmitting = false;
    this.loadLocations();
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  private modalFeedback(message: string, success: boolean): void {
    this.modalFeedbackMessage = message;
    this.modalFeedbackSuccess = success;
    this.showModalFeedback = true;
    setTimeout(() => (this.showModalFeedback = false), 5000);
  }

  get selectedLocationOrProposed(): LocationDto | null {
    if (this.selectedLocation) return this.selectedLocation;
    if (this.proposedLocationName)
      return { id: 0, locationName: this.proposedLocationName };
    return null;
  }

  clearLabName(): void {
    this.labForm.get('labName')?.setValue('');
  }
}
