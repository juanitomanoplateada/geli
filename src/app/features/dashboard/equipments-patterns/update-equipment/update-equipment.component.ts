import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Directives
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { UppercaseNospaceDirective } from '../../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';

// Components
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { DropdownSearchEntityComponent } from '../../../../shared/components/dropdown-search-entity/dropdown-search-entity.component';
import { DropdownSearchEntityObjComponent } from '../../../../shared/components/dropdown-search-entity-obj/dropdown-search-entity-obj.component';
import { TagMultiselectComponent } from '../../../../shared/components/tag-multiselect/tag-multiselect.component';

// Services
import { EquipmentService } from '../../../../core/services/equipment/equipment.service';
import { LaboratoryService } from '../../../../core/services/laboratory/laboratory.service';
import { BrandService } from '../../../../core/services/brand/brand.service';
import { FunctionService } from '../../../../core/services/function/function.service';
import { FunctionDto } from '../../../../core/dto/function/function-response.dto';

@Component({
  selector: 'app-update-equipment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UppercaseDirective,
    UppercaseNospaceDirective,
    ConfirmModalComponent,
    DropdownSearchEntityComponent,
    DropdownSearchEntityObjComponent,
    TagMultiselectComponent,
  ],
  templateUrl: './update-equipment.component.html',
  styleUrls: ['./update-equipment.component.scss'],
})
export class UpdateEquipmentComponent implements OnInit {
  // Form and state management
  equipmentForm: FormGroup;
  isInventoryCodeTaken = false;
  isSubmitting = false;
  notesRequired = false;
  equipmentId: number | null = null;

  // Modal states
  showConfirmationModal = false;
  showModalFeedback = false;
  modalFeedbackMessage = '';
  modalFeedbackSuccess = false;

  // Data options
  brandOptions: { label: string; value: string }[] = [];
  labOptions: { label: string; value: string }[] = [];
  availableFunctions: FunctionDto[] = [];
  selectedFunctions: FunctionDto[] = [];

  // Selected values
  selectedBrandOrProposed: string | null = null;
  selectedLab: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private equipmentService: EquipmentService,
    private brandService: BrandService,
    private laboratoryService: LaboratoryService,
    private functionService: FunctionService
  ) {
    this.equipmentForm = this.fb.group({
      inventoryCode: ['', Validators.required],
      name: ['', Validators.required],
      brand: ['', Validators.required],
      lab: ['', Validators.required],
      availability: ['', Validators.required],
      notes: [''],
      functionId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  // Initialization
  private initializeComponent(): void {
    this.loadRouteParams();
    this.loadBrandOptions();
    this.loadLabOptions();
    this.loadFunctionOptions();
  }

  private loadRouteParams(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.equipmentId = +id;
        this.loadEquipmentData(this.equipmentId);
        this.setupInventoryCodeValidation();
      }
    });
  }

  private setupInventoryCodeValidation(): void {
    this.equipmentForm.get('inventoryCode')?.valueChanges.subscribe((value) => {
      const trimmed = value?.trim();
      if (trimmed && this.equipmentId) {
        this.equipmentService
          .existsByInventoryNumberUpdate(trimmed, this.equipmentId)
          .subscribe((exists) => {
            this.isInventoryCodeTaken = exists;
          });
      } else {
        this.isInventoryCodeTaken = false;
      }
    });
  }

  private loadBrandOptions(): void {
    this.brandService.getAll().subscribe((brands) => {
      this.brandOptions =
        brands?.map((b) => ({
          label: b.brandName,
          value: b.id.toString(),
        })) || [];
    });
  }

  private loadLabOptions(): void {
    this.laboratoryService.getLaboratories().subscribe((labs) => {
      this.labOptions = labs
        .filter((l) => l.id != null)
        .map((l) => ({ label: l.laboratoryName, value: l.id!.toString() }));
    });
  }

  private loadFunctionOptions(): void {
    this.functionService.getAll().subscribe((functions) => {
      this.availableFunctions = functions.sort((a, b) => {
        if (a.functionName === 'NO APLICA') return -1;
        if (b.functionName === 'NO APLICA') return 1;
        return 0;
      });
    });
  }

  // Data loading
  loadEquipmentData(id: number): void {
    this.equipmentService.getById(id).subscribe((data) => {
      if (!data) return;

      this.equipmentForm.patchValue({
        inventoryCode: data.inventoryNumber,
        name: data.equipmentName,
        brand: data.brand.id.toString(),
        lab: data.laboratory.id.toString(),
        availability: data.availability ? 'ACTIVO' : 'INACTIVO',
        notes: data.equipmentObservations,
        functionId: 'valid',
      });

      this.selectedBrandOrProposed = data.brand.brandName;
      this.selectedLab = data.laboratory.id.toString();
      this.selectedFunctions = data.functions;
    });
  }

  // Event handlers
  onSelectBrand(brandId: string): void {
    const selected = this.brandOptions.find((b) => b.value === brandId);
    if (selected) {
      this.selectedBrandOrProposed = selected.label;
      this.equipmentForm.get('brand')?.setValue(brandId);
    }
  }

  onProposeBrand(newBrand: string): void {
    const formatted = newBrand.trim().toUpperCase();
    const newOption = { label: formatted, value: formatted };
    this.brandOptions.push(newOption);
    this.selectedBrandOrProposed = formatted;
    this.equipmentForm.get('brand')?.setValue(formatted);
  }

  onSelectLab(labId: string): void {
    const selected = this.labOptions.find((l) => l.value === labId);
    if (selected) {
      this.selectedLab = labId;
      this.equipmentForm.get('lab')?.setValue(labId);
      this.equipmentForm.get('lab')?.markAsTouched();
      this.equipmentForm.get('lab')?.updateValueAndValidity();
    }
  }

  onFunctionChange(selected: FunctionDto[]): void {
    this.selectedFunctions = selected;
    this.equipmentForm
      .get('functionId')
      ?.setValue(selected.length > 0 ? 'valid' : '');
  }

  onAvailabilityChange(): void {
    const status = this.equipmentForm.get('availability')?.value;
    this.notesRequired = status === 'INACTIVO';
    const notesControl = this.equipmentForm.get('notes');

    if (this.notesRequired) {
      notesControl?.setValidators([Validators.required]);
    } else {
      notesControl?.clearValidators();
    }
    notesControl?.updateValueAndValidity();
  }

  // Form submission
  submitForm(): void {
    if (
      this.equipmentForm.valid &&
      this.selectedFunctions.length > 0 &&
      !(this.notesRequired && this.equipmentForm.get('notes')?.invalid)
    ) {
      this.showConfirmationModal = true;
    }
  }

  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  async confirmSubmit(): Promise<void> {
    this.isSubmitting = true;

    try {
      const brandId = await this.handleBrandSelection();
      const allFunctions = await this.handleFunctionSelection();

      const payload = this.createPayload(brandId, allFunctions);

      if (this.equipmentId) {
        await this.equipmentService
          .update(this.equipmentId, payload)
          .toPromise();
        this.showSuccessFeedback('✅ Equipo actualizado exitosamente.');
      }

      this.resetSubmissionState();
    } catch (error) {
      this.showErrorFeedback('❌ Error al actualizar el equipo');
    }
  }

  private async handleBrandSelection(): Promise<number> {
    const selectedBrand = this.brandOptions.find(
      (b) => b.label === this.selectedBrandOrProposed
    );

    if (selectedBrand && isNaN(Number(selectedBrand.value))) {
      const createdBrand = await this.brandService
        .create({ brandName: selectedBrand.label })
        .toPromise();
      return createdBrand!.id;
    }
    return Number(selectedBrand?.value);
  }

  private async handleFunctionSelection(): Promise<FunctionDto[]> {
    const newFunctions = this.selectedFunctions.filter((f) => f.id === 0);
    const existingFunctions = this.selectedFunctions.filter((f) => f.id !== 0);
    const createdFunctions: FunctionDto[] = [];

    for (const func of newFunctions) {
      const created = await this.functionService
        .create({ functionName: func.functionName })
        .toPromise();
      createdFunctions.push(created!);
    }

    return [...existingFunctions, ...createdFunctions];
  }

  private createPayload(brandId: number, allFunctions: FunctionDto[]): any {
    return {
      equipmentName: this.equipmentForm.get('name')?.value,
      inventoryNumber: this.equipmentForm.get('inventoryCode')?.value,
      brand: {
        id: brandId,
        brandName: this.selectedBrandOrProposed ?? '',
      },
      laboratoryId: Number(this.equipmentForm.get('lab')?.value),
      availability: this.equipmentForm.get('availability')?.value === 'ACTIVO',
      equipmentObservations: this.equipmentForm.get('notes')?.value || '',
      authorizedUsersIds: [],
      functions: allFunctions.map((f) => f.id),
    };
  }

  private showSuccessFeedback(message: string): void {
    this.modalFeedbackSuccess = true;
    this.modalFeedbackMessage = message;
    this.showModalFeedback = true;
  }

  private showErrorFeedback(message: string): void {
    this.modalFeedbackSuccess = false;
    this.modalFeedbackMessage = message;
    this.showModalFeedback = true;
    this.isSubmitting = false;
  }

  private resetSubmissionState(): void {
    setTimeout(() => {
      this.isSubmitting = false;
      this.showModalFeedback = false;
      this.showConfirmationModal = false;
    }, 4000);
  }

  // Utility methods
  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  selectedIdLab(labName: string): number {
    const selected = this.labOptions.find((l) => l.label === labName);
    return Number(selected?.value);
  }

  get formSummary() {
    const values = this.equipmentForm.value;
    return {
      ...values,
      brand: this.selectedBrandOrProposed,
      lab:
        this.labOptions.find((l) => l.value === this.selectedLab)?.label || '',
      functions: this.selectedFunctions.map((f) => f.functionName).join(', '),
    };
  }

  // Navigation
  goBack(): void {
    this.router.navigate([
      '/dashboard/equipments-patterns/search-equipment-pattern',
    ]);
  }
}
