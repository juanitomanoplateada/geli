import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrandDto } from '../../../../core/dto/brand/brand-response.dto';
import {
  debounceTime,
  distinctUntilChanged,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { BrandService } from '../../../../core/services/brand/brand.service';
import { CommonModule } from '@angular/common';
import { DropdownSearchSelectComponent } from '../../../../shared/components/dropdown-search-select/dropdown-search-select.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { InputRulesDirective } from '../../../../shared/directives/input-rules/input-rules';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownSearchSelectComponent,
    ConfirmModalComponent,
    InputRulesDirective,
  ],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.scss',
})
export class BrandsComponent {
  updateForm: FormGroup;
  availableBrands: { label: string; value: BrandDto }[] = [];
  selectedBrand: BrandDto | null = null;

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

  constructor(private fb: FormBuilder, private brandService: BrandService) {
    this.updateForm = this.fb.group({
      currentBrand: [null, Validators.required],
      newBrandName: [{ value: '', disabled: false }, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadBrands();
    this.setupNameChecker();
  }

  loadBrands(): void {
    this.brandService.getAll().subscribe({
      next: (data) => {
        this.availableBrands = data.map((p) => ({
          label: p.brandName,
          value: p,
        }));
      },
      error: () => {
        this.feedbackMessage = 'Error al cargar las marcas.';
        this.feedbackSuccess = false;
      },
    });
  }

  onSelectBrand(brand: BrandDto): void {
    this.selectedBrand = brand;
    this.updateForm.get('currentBrand')?.setValue(brand);
    this.updateForm.get('newBrandName')?.setValue(brand.brandName);
  }

  get isSameAsCurrent(): boolean {
    const current = this.selectedBrand?.brandName?.trim().toUpperCase() || '';
    const input =
      this.updateForm.get('newBrandName')?.value?.trim().toUpperCase() || '';
    return current === input;
  }

  setupNameChecker(): void {
    const newBrandCtrl = this.updateForm.get('newBrandName');

    this.nameCheck$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((name) => {
          const trimmed = name.trim();
          if (!trimmed || trimmed === this.selectedBrand?.brandName?.trim()) {
            this.nameExists = false;
            return of(false);
          }

          this.checkingName = true;
          newBrandCtrl?.disable(); // 🔒 Desactiva mientras consulta
          return this.brandService.existsByName(trimmed);
        })
      )
      .subscribe({
        next: (exists) => {
          this.nameExists = exists;
          this.checkingName = false;
          newBrandCtrl?.enable(); // ✅ Rehabilita siempre tras respuesta
        },
        error: () => {
          this.nameExists = false;
          this.checkingName = false;
          newBrandCtrl?.enable(); // ✅ Habilita incluso si hay error
        },
      });

    newBrandCtrl?.valueChanges.subscribe((val) => {
      this.nameCheck$.next(val);
    });
  }

  openConfirmationModal(): void {
    if (this.updateForm.invalid || !this.selectedBrand || this.nameExists)
      return;

    const newName = this.updateForm.get('newBrandName')?.value.trim();
    if (!newName || newName === this.selectedBrand.brandName) {
      this.feedbackMessage = 'El nuevo nombre debe ser diferente.';
      this.feedbackSuccess = false;
      return;
    }

    this.showConfirmationModal = true;
  }

  submitUpdate(): void {
    if (this.updateForm.invalid || !this.selectedBrand || this.nameExists)
      return;

    this.isSubmitting = true;
    this.feedbackMessage = '';
    this.feedbackSuccess = false;

    const updatedName = this.updateForm.get('newBrandName')?.value.trim();
    const dto: BrandDto = {
      ...this.selectedBrand,
      brandName: updatedName,
    };

    this.brandService.update(this.selectedBrand.id!, dto).subscribe({
      next: () => {
        this.showModalFeedback = true;
        this.modalFeedbackMessage = '✅ Marca actualizada correctamente.';
        this.modalFeedbackSuccess = true;

        this.loadBrands();

        // Muestra feedback un momento antes de cerrar
        setTimeout(() => {
          this.isSubmitting = false;
          this.showConfirmationModal = false;
          this.updateForm.reset();
          this.selectedBrand = null;
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
