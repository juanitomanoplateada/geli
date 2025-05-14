import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { DropdownSearchEntityComponent } from '../../../../shared/components/dropdown-search-entity/dropdown-search-entity.component';

import { LaboratoryService } from '../../../../core/laboratory/services/laboratory.service';
import {
  LocationService,
  LocationDto,
} from '../../../../core/location/services/location.service';
import { Laboratory } from '../../../../core/laboratory/models/laboratory.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-update-laboratory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UppercaseDirective,
    ConfirmModalComponent,
    DropdownSearchEntityComponent,
  ],
  templateUrl: './update-laboratory.component.html',
  styleUrls: ['./update-laboratory.component.scss'],
})
export class UpdateLaboratoryComponent implements OnInit {
  labForm: FormGroup;
  labId = 0;
  availableLocations: { label: string; value: LocationDto }[] = [];
  selectedLocation: LocationDto | null = null;
  proposedLocationName: string | null = null;
  showConfirmationModal = false;
  notesRequired = false;
  isSubmitting = false;
  modalFeedbackMessage = '';
  modalFeedbackSuccess = false;
  showModalFeedback = false;

  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private laboratoryService: LaboratoryService,
    private locationService: LocationService,
    private router: Router
  ) {
    this.labForm = this.fb.group({
      labName: [{ value: '', disabled: true }],
      description: ['', Validators.required],
      locationName: ['', Validators.required],
      status: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.labId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;

    const locations$ = this.locationService.getAll();
    const lab$ = this.laboratoryService.getLaboratoryById(this.labId);

    forkJoin([locations$, lab$]).subscribe({
      next: ([locations, lab]) => {
        this.availableLocations = locations.map((l) => ({
          label: l.locationName,
          value: l,
        }));

        this.labForm.patchValue({
          labName: lab.laboratoryName,
          description: lab.laboratoryDescription,
          locationName: lab.location.locationName,
          status: lab.laboratoryAvailability ? 'ACTIVO' : 'INACTIVO',
          notes: lab.laboratoryObservations,
        });

        this.selectedLocation = {
          id: lab.location?.id || 0,
          locationName: lab.location.locationName,
        };

        this.notesRequired = !lab.laboratoryAvailability;
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private loadLocations(): void {
    this.locationService.getAll().subscribe({
      next: (locations) => {
        this.availableLocations = locations.map((l) => ({
          label: l.locationName,
          value: l,
        }));
      },
      error: (err) => console.error('Error cargando ubicaciones:', err),
    });
  }

  private loadLaboratoryData(): void {
    this.laboratoryService.getLaboratoryById(this.labId).subscribe({
      next: (lab) => {
        this.labForm.patchValue({
          labName: lab.laboratoryName,
          description: lab.laboratoryDescription,
          locationName: lab.location.locationName,
          status: lab.laboratoryAvailability ? 'ACTIVO' : 'INACTIVO',
          notes: lab.laboratoryObservations,
        });
        this.selectedLocation = {
          id: lab.location?.id || 0,
          locationName: lab.location.locationName,
        };
        this.notesRequired = !lab.laboratoryAvailability;
      },
      error: (err) => console.error('Error cargando laboratorio:', err),
    });
  }

  onSelectLocation(location: LocationDto): void {
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
      this.labForm.patchValue({ notes: '' });
    }
    notesControl?.updateValueAndValidity();
  }

  submitForm(): void {
    this.labForm.markAllAsTouched();

    if (this.labForm.invalid) return;

    if (
      this.labForm.get('status')?.value === 'INACTIVO' &&
      !this.labForm.get('notes')?.value?.trim()
    ) {
      this.modalFeedback(
        'Debe ingresar observaciones para un laboratorio inactivo.',
        false
      );
      return;
    }

    this.showConfirmationModal = true;
  }

  confirmUpdate(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.modalFeedbackMessage = 'Procesando actualización...';
    this.modalFeedbackSuccess = true;
    this.showModalFeedback = true;

    const form = this.labForm.getRawValue();
    const locationName = form.locationName.trim().toUpperCase();

    const existing = this.availableLocations.find(
      (opt) => opt.label.toUpperCase() === locationName
    );

    const finalizeUpdate = (location: LocationDto) => {
      const payload: Laboratory = {
        laboratoryName: form.labName,
        laboratoryDescription: form.description,
        location: {
          id: location.id,
          locationName: location.locationName,
        },
        laboratoryAvailability: form.status === 'ACTIVO',
        laboratoryObservations:
          form.status === 'ACTIVO' ? '' : form.notes?.trim() ?? '',
      };

      this.laboratoryService.updateLaboratory(this.labId, payload).subscribe({
        next: () => {
          this.modalFeedbackMessage =
            '✅ Laboratorio actualizado exitosamente.';
          this.modalFeedbackSuccess = true;
          this.loadLaboratoryData();

          setTimeout(() => {
            this.modalFeedbackMessage = '';
            this.modalFeedbackSuccess = false;
            this.showConfirmationModal = false;
            this.isSubmitting = false;
          }, 4000);
        },
        error: () => {
          this.modalFeedbackMessage = '❌ Error al actualizar laboratorio.';
          this.modalFeedbackSuccess = false;
          this.isSubmitting = false;
        },
      });
    };

    if (existing) {
      finalizeUpdate(existing.value);
    } else if (this.proposedLocationName) {
      this.locationService
        .create({ locationName: this.proposedLocationName })
        .subscribe({
          next: (newLocation) => {
            this.availableLocations.push({
              label: newLocation.locationName,
              value: newLocation,
            });
            this.selectedLocation = newLocation;
            this.labForm
              .get('locationName')
              ?.setValue(newLocation.locationName);
            finalizeUpdate(newLocation);
          },
          error: () => {
            this.modalFeedbackMessage = '❌ Error al crear ubicación.';
            this.modalFeedbackSuccess = false;
            this.isSubmitting = false;
          },
        });
    } else {
      this.modalFeedbackMessage = '❌ Ubicación inválida o no seleccionada.';
      this.modalFeedbackSuccess = false;
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

  goBack(): void {
    this.router.navigate(['/dashboard/laboratories/search-laboratory']);
  }

  get selectedLocationOrProposed(): LocationDto | null {
    if (this.selectedLocation) return this.selectedLocation;
    if (this.proposedLocationName)
      return { id: 0, locationName: this.proposedLocationName };
    return null;
  }
}
