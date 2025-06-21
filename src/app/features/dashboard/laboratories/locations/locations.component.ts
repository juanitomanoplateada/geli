import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownSearchSelectComponent } from '../../../../shared/components/dropdown-search-select/dropdown-search-select.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { InputRulesDirective } from '../../../../shared/directives/input-rules/input-rules';
import { LocationDto } from '../../../../core/dto/location/location-response.dto';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { LocationService } from '../../../../core/services/location/location.service';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownSearchSelectComponent,
    ConfirmModalComponent,
    InputRulesDirective,
  ],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss',
})
export class LocationsComponent {
  updateForm: FormGroup;
  availableLocations: { label: string; value: LocationDto }[] = [];
  selectedLocation: LocationDto | null = null;

  isSubmitting = false;
  feedbackMessage: string = '';
  feedbackSuccess = false;

  showConfirmationModal = false;

  // 👇 Validación de existencia
  nameCheck$ = new Subject<string>();
  nameExists = false;
  checkingName = false;

  showModalFeedback = false;
  modalFeedbackMessage = '';
  modalFeedbackSuccess = false;

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService
  ) {
    this.updateForm = this.fb.group({
      currentLocation: [null, Validators.required],
      newLocationName: [{ value: '', disabled: false }, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadLocations();
    this.setupNameChecker();
  }

  loadLocations(): void {
    this.locationService.getAll().subscribe({
      next: (data) => {
        this.availableLocations = data.map((p) => ({
          label: p.locationName,
          value: p,
        }));
      },
      error: () => {
        this.feedbackMessage = 'Error al cargar las ubicaciones.';
        this.feedbackSuccess = false;
      },
    });
  }

  onSelectLocation(location: LocationDto): void {
    this.selectedLocation = location;
    this.updateForm.get('currentLocation')?.setValue(location);
    this.updateForm.get('newLocationName')?.setValue(location.locationName);
  }

  get isSameAsCurrent(): boolean {
    const current =
      this.selectedLocation?.locationName?.trim().toUpperCase() || '';
    const input =
      this.updateForm.get('newLocationName')?.value?.trim().toUpperCase() || '';
    return current === input;
  }

  setupNameChecker(): void {
    const newLocationCtrl = this.updateForm.get('newLocationName');

    this.nameCheck$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((name) => {
          const trimmed = name.trim();
          if (
            !trimmed ||
            trimmed === this.selectedLocation?.locationName?.trim()
          ) {
            this.nameExists = false;
            return of(false);
          }

          this.checkingName = true;
          newLocationCtrl?.disable(); // 🔒 Desactiva mientras consulta
          return this.locationService.existsByName(trimmed);
        })
      )
      .subscribe({
        next: (exists) => {
          this.nameExists = exists;
          this.checkingName = false;
          newLocationCtrl?.enable(); // ✅ Rehabilita siempre tras respuesta
        },
        error: () => {
          this.nameExists = false;
          this.checkingName = false;
          newLocationCtrl?.enable(); // ✅ Habilita incluso si hay error
        },
      });

    newLocationCtrl?.valueChanges.subscribe((val) => {
      this.nameCheck$.next(val);
    });
  }

  openConfirmationModal(): void {
    if (this.updateForm.invalid || !this.selectedLocation || this.nameExists)
      return;

    const newName = this.updateForm.get('newLocationName')?.value.trim();
    if (!newName || newName === this.selectedLocation.locationName) {
      this.feedbackMessage = 'El nuevo nombre debe ser diferente.';
      this.feedbackSuccess = false;
      return;
    }

    this.showConfirmationModal = true;
  }

  submitUpdate(): void {
    if (this.updateForm.invalid || !this.selectedLocation || this.nameExists)
      return;

    this.isSubmitting = true;
    this.feedbackMessage = '';
    this.feedbackSuccess = false;

    const updatedName = this.updateForm.get('newLocationName')?.value.trim();
    const dto: LocationDto = {
      ...this.selectedLocation,
      locationName: updatedName,
    };

    this.locationService.update(this.selectedLocation.id!, dto).subscribe({
      next: () => {
        this.showModalFeedback = true;
        this.modalFeedbackMessage = '✅ Ubicación actualizada correctamente.';
        this.modalFeedbackSuccess = true;

        this.loadLocations();

        // Muestra feedback un momento antes de cerrar
        setTimeout(() => {
          this.isSubmitting = false;
          this.showConfirmationModal = false;
          this.updateForm.reset();
          this.selectedLocation = null;
          this.showModalFeedback = false;
        }, 3000);
      },
      error: (err) => {
        this.showModalFeedback = true;

        this.modalFeedbackMessage =
          err?.error?.message || '❌ Error al actualizar la ubicación.';
        this.modalFeedbackSuccess = false;

        this.isSubmitting = false;
      },
    });
  }

  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }
}
