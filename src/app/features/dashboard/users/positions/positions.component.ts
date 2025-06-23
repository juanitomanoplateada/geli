import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// Components
import { DropdownSearchSelectComponent } from '../../../../shared/components/dropdown-search-select/dropdown-search-select.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

// Services
import { PositionService } from '../../../../core/services/position/position.service';
import { PositionHelperService } from '../../../../core/services/position/position-helper.service';

// Directives
import { InputRulesDirective } from '../../../../shared/directives/input-rules/input-rules';

// DTOs
import { PositionDto } from '../../../../core/dto/position/position-response.dto';

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
  // Form properties
  updateForm: FormGroup;

  // Position list properties
  availablePositionsList: { label: string; value: PositionDto }[] = [];
  selectedPosition: PositionDto | null = null;

  // Feedback properties
  isSubmitting = false;
  feedbackMessage: string = '';
  feedbackSuccess = false;

  // Modal properties
  showConfirmationModal = false;
  showModalFeedback = false;
  modalFeedbackMessage = '';
  modalFeedbackSuccess = false;
  modalSuccessType: 'success' | 'error' | '' = '';

  // Name validation properties
  nameCheck$ = new Subject<string>();
  nameExists = false;
  checkingName = false;

  constructor(
    private fb: FormBuilder,
    private positionService: PositionService,
    private positionHelperService: PositionHelperService
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

  // ==================== POSITION LOADING ====================
  private loadPositions(): void {
    this.positionHelperService.getFormattedPositionOptions().subscribe({
      next: (options) => {
        this.availablePositionsList = options;
      },
    });
  }

  // ==================== FORM HANDLING ====================
  onSelectCargo(position: PositionDto): void {
    this.selectedPosition = position;
    this.updateForm.get('currentPosition')?.setValue(position);
    this.updateForm.get('newPositionName')?.setValue(position.positionName);
  }

  get isSameAsCurrent(): boolean {
    const current =
      this.selectedPosition?.positionName?.trim().toUpperCase() || '';
    const input =
      this.updateForm.get('newPositionName')?.value?.trim().toUpperCase() || '';
    return current === input;
  }

  // ==================== NAME VALIDATION ====================
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
            trimmed === this.selectedPosition?.positionName?.trim()
          ) {
            this.nameExists = false;
            return of(false);
          }

          this.checkingName = true;
          newPositionCtrl?.disable();
          return this.positionService.existsByName(trimmed);
        })
      )
      .subscribe({
        next: (exists) => {
          this.nameExists = exists;
          this.checkingName = false;
          newPositionCtrl?.enable();
        },
        error: () => {
          this.nameExists = false;
          this.checkingName = false;
          newPositionCtrl?.enable();
        },
      });

    newPositionCtrl?.valueChanges.subscribe((val) => {
      this.nameCheck$.next(val);
    });
  }

  // ==================== MODAL HANDLING ====================
  openConfirmationModal(): void {
    if (this.updateForm.invalid || !this.selectedPosition || this.nameExists)
      return;

    const newName = this.updateForm.get('newPositionName')?.value.trim();
    if (!newName || newName === this.selectedPosition.positionName) {
      this.feedbackMessage = 'El nuevo nombre debe ser diferente.';
      this.feedbackSuccess = false;
      return;
    }

    this.showConfirmationModal = true;
  }

  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  // ==================== FORM SUBMISSION ====================
  submitUpdate(): void {
    if (this.updateForm.invalid || !this.selectedPosition || this.nameExists)
      return;

    this.isSubmitting = true;
    this.feedbackMessage = '';
    this.feedbackSuccess = false;

    const updatedName = this.updateForm.get('newPositionName')?.value.trim();
    const dto: PositionDto = {
      ...this.selectedPosition,
      positionName: updatedName,
    };

    this.positionService.update(this.selectedPosition.id!, dto).subscribe({
      next: () => {
        this.showModalFeedback = true;
        this.modalFeedbackMessage = '✅ Cargo actualizado correctamente.';
        this.modalFeedbackSuccess = true;
        this.modalSuccessType = 'success';

        this.loadPositions();

        setTimeout(() => {
          this.isSubmitting = false;
          this.showConfirmationModal = false;
          this.updateForm.reset();
          this.selectedPosition = null;
          this.showModalFeedback = false;
          this.modalSuccessType = '';
          this.modalFeedbackMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.showModalFeedback = true;
        this.modalFeedbackMessage =
          err?.error?.message || '❌ Error al actualizar el cargo.';
        this.modalFeedbackSuccess = false;
        this.isSubmitting = false;
        this.modalSuccessType = 'error';

        setTimeout(() => {
          this.showConfirmationModal = false;
          this.isSubmitting = false;
          this.modalSuccessType = '';
          this.modalFeedbackMessage = '';
        }, 3000);
      },
    });
  }
}
