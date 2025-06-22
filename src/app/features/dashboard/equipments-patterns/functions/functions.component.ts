import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FunctionDto } from '../../../../core/dto/function/function-response.dto';
import {
  debounceTime,
  distinctUntilChanged,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { FunctionService } from '../../../../core/services/function/function.service';
import { CommonModule } from '@angular/common';
import { DropdownSearchSelectComponent } from '../../../../shared/components/dropdown-search-select/dropdown-search-select.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { InputRulesDirective } from '../../../../shared/directives/input-rules/input-rules';

@Component({
  selector: 'app-functions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownSearchSelectComponent,
    ConfirmModalComponent,
    InputRulesDirective,
  ],
  templateUrl: './functions.component.html',
  styleUrl: './functions.component.scss',
})
export class FunctionsComponent {
  updateForm: FormGroup;
  availableFunctions: { label: string; value: FunctionDto }[] = [];
  selectedFunction: FunctionDto | null = null;

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

  constructor(private fb: FormBuilder, private functionService: FunctionService) {
    this.updateForm = this.fb.group({
      currentFunction: [null, Validators.required],
      newFunctionName: [{ value: '', disabled: false }, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadFunctions();
    this.setupNameChecker();
  }

  loadFunctions(): void {
    this.functionService.getAll().subscribe({
      next: (data) => {
        this.availableFunctions = data.map((p) => ({
          label: p.functionName,
          value: p,
        }));
      },
      error: () => {
        this.feedbackMessage = 'Error al cargar las marcas.';
        this.feedbackSuccess = false;
      },
    });
  }

  onSelectFunction(functions: FunctionDto): void {
    this.selectedFunction = functions;
    this.updateForm.get('currentFunction')?.setValue(functions);
    this.updateForm.get('newFunctionName')?.setValue(functions.functionName);
  }

  get isSameAsCurrent(): boolean {
    const current = this.selectedFunction?.functionName?.trim().toUpperCase() || '';
    const input =
      this.updateForm.get('newFunctionName')?.value?.trim().toUpperCase() || '';
    return current === input;
  }

  setupNameChecker(): void {
    const newFunctionCtrl = this.updateForm.get('newFunctionName');

    this.nameCheck$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((name) => {
          const trimmed = name.trim();
          if (!trimmed || trimmed === this.selectedFunction?.functionName?.trim()) {
            this.nameExists = false;
            return of(false);
          }

          this.checkingName = true;
          newFunctionCtrl?.disable(); // 🔒 Desactiva mientras consulta
          return this.functionService.existsByName(trimmed);
        })
      )
      .subscribe({
        next: (exists) => {
          this.nameExists = exists;
          this.checkingName = false;
          newFunctionCtrl?.enable(); // ✅ Rehabilita siempre tras respuesta
        },
        error: () => {
          this.nameExists = false;
          this.checkingName = false;
          newFunctionCtrl?.enable(); // ✅ Habilita incluso si hay error
        },
      });

    newFunctionCtrl?.valueChanges.subscribe((val) => {
      this.nameCheck$.next(val);
    });
  }

  openConfirmationModal(): void {
    if (this.updateForm.invalid || !this.selectedFunction || this.nameExists)
      return;

    const newName = this.updateForm.get('newFunctionName')?.value.trim();
    if (!newName || newName === this.selectedFunction.functionName) {
      this.feedbackMessage = 'El nuevo nombre debe ser diferente.';
      this.feedbackSuccess = false;
      return;
    }

    this.showConfirmationModal = true;
  }

  submitUpdate(): void {
    if (this.updateForm.invalid || !this.selectedFunction || this.nameExists)
      return;

    this.isSubmitting = true;
    this.feedbackMessage = '';
    this.feedbackSuccess = false;

    const updatedName = this.updateForm.get('newFunctionName')?.value.trim();
    const dto: FunctionDto = {
      ...this.selectedFunction,
      functionName: updatedName,
    };

    this.functionService.update(this.selectedFunction.id!, dto).subscribe({
      next: () => {
        this.showModalFeedback = true;
        this.modalFeedbackMessage = '✅ Función actualizada correctamente.';
        this.modalFeedbackSuccess = true;

        this.loadFunctions();

        // Muestra feedback un momento antes de cerrar
        setTimeout(() => {
          this.isSubmitting = false;
          this.showConfirmationModal = false;
          this.updateForm.reset();
          this.selectedFunction = null;
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
