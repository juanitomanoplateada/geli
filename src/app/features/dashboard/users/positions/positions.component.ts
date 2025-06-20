import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownSearchSelectComponent } from '../../../../shared/components/dropdown-search-select/dropdown-search-select.component';
import { PositionService } from '../../../../core/services/position/position.service';
import { PositionDto } from '../../../../core/dto/position/position-response.dto';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { InputRulesDirective } from '../../../../shared/directives/input-rules/input-rules';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-positions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownSearchSelectComponent,
    ConfirmModalComponent,
    InputRulesDirective,
  ],
  templateUrl: './positions.component.html',
  styleUrl: './positions.component.scss',
})
export class PositionsComponent implements OnInit {
  updateForm: FormGroup;
  availableCargos: { label: string; value: PositionDto }[] = [];
  selectedCargo: PositionDto | null = null;

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
    private positionService: PositionService
  ) {
    this.updateForm = this.fb.group({
      currentPosition: [null, Validators.required],
      newPositionName: [{ value: '', disabled: false }, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPositions();
    this.setupNameChecker();
  }

  loadPositions(): void {
    this.positionService.getAll().subscribe({
      next: (data) => {
        this.availableCargos = data.map((p) => ({
          label: p.positionName,
          value: p,
        }));
      },
      error: () => {
        this.feedbackMessage = 'Error al cargar los cargos.';
        this.feedbackSuccess = false;
      },
    });
  }

  onSelectCargo(position: PositionDto): void {
    this.selectedCargo = position;
    this.updateForm.get('currentPosition')?.setValue(position);
    this.updateForm.get('newPositionName')?.setValue(position.positionName);
  }

  get isSameAsCurrent(): boolean {
    const current =
      this.selectedCargo?.positionName?.trim().toUpperCase() || '';
    const input =
      this.updateForm.get('newPositionName')?.value?.trim().toUpperCase() || '';
    return current === input;
  }

  setupNameChecker(): void {
    const newPositionCtrl = this.updateForm.get('newPositionName');

    this.nameCheck$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((name) => {
          const trimmed = name.trim();
          if (
            !trimmed ||
            trimmed === this.selectedCargo?.positionName?.trim()
          ) {
            this.nameExists = false;
            return of(false);
          }

          this.checkingName = true;
          newPositionCtrl?.disable(); // 🔒 Desactiva mientras consulta
          return this.positionService.existsByName(trimmed);
        })
      )
      .subscribe({
        next: (exists) => {
          this.nameExists = exists;
          this.checkingName = false;
          newPositionCtrl?.enable(); // ✅ Rehabilita siempre tras respuesta
        },
        error: () => {
          this.nameExists = false;
          this.checkingName = false;
          newPositionCtrl?.enable(); // ✅ Habilita incluso si hay error
        },
      });

    newPositionCtrl?.valueChanges.subscribe((val) => {
      this.nameCheck$.next(val);
    });
  }

  openConfirmationModal(): void {
    if (this.updateForm.invalid || !this.selectedCargo || this.nameExists)
      return;

    const newName = this.updateForm.get('newPositionName')?.value.trim();
    if (!newName || newName === this.selectedCargo.positionName) {
      this.feedbackMessage = 'El nuevo nombre debe ser diferente.';
      this.feedbackSuccess = false;
      return;
    }

    this.showConfirmationModal = true;
  }

  submitUpdate(): void {
    if (this.updateForm.invalid || !this.selectedCargo || this.nameExists)
      return;

    this.isSubmitting = true;
    this.feedbackMessage = '';
    this.feedbackSuccess = false;

    const updatedName = this.updateForm.get('newPositionName')?.value.trim();
    const dto: PositionDto = {
      ...this.selectedCargo,
      positionName: updatedName,
    };

    this.positionService.update(this.selectedCargo.id!, dto).subscribe({
      next: () => {
        this.showModalFeedback = true;
        this.modalFeedbackMessage = '✅ Cargo actualizado correctamente.';
        this.modalFeedbackSuccess = true;

        this.loadPositions();

        // Muestra feedback un momento antes de cerrar
        setTimeout(() => {
          this.isSubmitting = false;
          this.showConfirmationModal = false;
          this.updateForm.reset();
          this.selectedCargo = null;
          this.showModalFeedback = false;
        }, 3000);
      },
      error: (err) => {
        this.showModalFeedback = true;

        this.modalFeedbackMessage =
          err?.error?.message || '❌ Error al actualizar el cargo.';
        this.modalFeedbackSuccess = false;

        this.isSubmitting = false;
      },
    });
  }

  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }
}
