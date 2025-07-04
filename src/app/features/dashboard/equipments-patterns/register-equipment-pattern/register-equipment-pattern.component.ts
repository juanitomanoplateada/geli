import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// Components
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { DropdownSearchEntityComponent } from '../../../../shared/components/dropdown-search-entity/dropdown-search-entity.component';
import { DropdownSearchEntityObjComponent } from './../../../../shared/components/dropdown-search-entity-obj/dropdown-search-entity-obj.component';
import { TagMultiselectComponent } from '../../../../shared/components/tag-multiselect/tag-multiselect.component';

// Directives
import { InputRulesDirective } from '../../../../shared/directives/input-rules/input-rules';

// Services
import { EquipmentService } from '../../../../core/services/equipment/equipment.service';
import { LaboratoryService } from '../../../../core/services/laboratory/laboratory.service';
import { BrandService } from '../../../../core/services/brand/brand.service';
import { FunctionService } from '../../../../core/services/function/function.service';

// DTOs
import { FunctionDto } from '../../../../core/dto/function/function-response.dto';

@Component({
  selector: 'app-register-equipment-pattern',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmModalComponent,
    DropdownSearchEntityComponent,
    DropdownSearchEntityObjComponent,
    TagMultiselectComponent,
    InputRulesDirective,
  ],
  templateUrl: './register-equipment-pattern.component.html',
  styleUrls: ['./register-equipment-pattern.component.scss'],
})
export class RegisterEquipmentPatternComponent implements OnInit {
  // Form and State
  equipmentForm: FormGroup;
  isNameTaken = false;
  isInventoryCodeTaken = false;
  isSubmitting = false;
  showConfirmationModal = false;
  showModalFeedback = false;
  modalFeedbackMessage = '';
  modalFeedbackSuccess = false;
  notesRequired = false;

  // Data Options
  brandOptions: { label: string; value: string }[] = [];
  labOptions: { label: string; value: string }[] = [];
  availableFunctions: FunctionDto[] = [];
  selectedFunctions: FunctionDto[] = [];

  // Selections
  selectedBrandOrProposed: string | null = null;
  selectedLab: string | null = null;

  constructor(
    private fb: FormBuilder,
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
    this.loadBrands();
    this.loadLaboratories();
    this.loadFunctions();
    this.setupInventoryCodeValidation();
  }

  // Initialization Methods
  private loadBrands(): void {
    this.brandService.getAll().subscribe((brands) => {
      this.brandOptions = brands
        ? brands.map((b) => ({
            label: b.brandName,
            value: b.id.toString(),
          }))
        : [];
    });
  }

  private loadLaboratories(): void {
    this.laboratoryService.getLaboratories().subscribe((labs) => {
      this.labOptions = labs
        ? labs
            .filter((l) => l.id != null)
            .map((l) => ({ label: l.laboratoryName, value: l.id!.toString() }))
        : [];
    });
  }

  private loadFunctions(): void {
    this.functionService.getAll().subscribe((functions) => {
      this.availableFunctions = functions.sort((a, b) => {
        if (a.functionName === 'NO APLICA') return -1;
        if (b.functionName === 'NO APLICA') return 1;
        return 0;
      });
    });
  }

  private setupInventoryCodeValidation(): void {
    this.equipmentForm.get('inventoryCode')?.valueChanges.subscribe((value) => {
      const trimmed = value?.trim();
      if (trimmed) {
        this.equipmentService
          .existsByInventoryNumber(trimmed)
          .subscribe((exists) => {
            this.isInventoryCodeTaken = exists;
          });
      } else {
        this.isInventoryCodeTaken = false;
      }
    });
  }

  // Form Control Methods
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

  // Form Submission Methods
  submitForm(): void {
    if (
      this.equipmentForm.valid &&
      !this.isInventoryCodeTaken &&
      !this.isNameTaken &&
      this.selectedFunctions.length > 0 &&
      !(this.notesRequired && this.equipmentForm.get('notes')?.invalid)
    ) {
      this.showConfirmationModal = true;
    }
  }

  async confirmSubmit(): Promise<void> {
    this.isSubmitting = true;

    try {
      const brandId = await this.handleBrandCreation();
      const allFunctions = await this.handleFunctionCreation();

      const payload = {
        equipmentName: this.equipmentForm.get('name')?.value,
        inventoryNumber: this.equipmentForm.get('inventoryCode')?.value,
        brand: {
          id: brandId,
          brandName: this.selectedBrandOrProposed ?? '',
        },
        laboratoryId: Number(this.equipmentForm.get('lab')?.value),
        availability:
          this.equipmentForm.get('availability')?.value === 'ACTIVO',
        equipmentObservations: this.equipmentForm.get('notes')?.value || '',
        authorizedUsersIds: [],
        functions: allFunctions.map((f) => f.id),
      };

      await this.equipmentService.create(payload).toPromise();
      this.showSuccessFeedback();
    } catch (error) {
      this.showErrorFeedback();
    }
  }

  private async handleBrandCreation(): Promise<number> {
    const selectedBrand = this.brandOptions.find(
      (b) => b.label === this.selectedBrandOrProposed
    );

    if (selectedBrand && isNaN(Number(selectedBrand.value))) {
      const createdBrand = await this.brandService
        .create({ brandName: selectedBrand.label })
        .toPromise();

      if (!createdBrand) throw new Error('No se pudo crear la marca');
      return createdBrand.id;
    }
    return Number(selectedBrand?.value);
  }

  private async handleFunctionCreation(): Promise<FunctionDto[]> {
    const newFunctions = this.selectedFunctions.filter((f) => f.id === 0);
    const existingFunctions = this.selectedFunctions.filter((f) => f.id !== 0);
    const createdFunctions: FunctionDto[] = [];

    for (const func of newFunctions) {
      const created = await this.functionService
        .create({ functionName: func.functionName })
        .toPromise();

      if (!created) {
        throw new Error(`No se pudo crear la función: ${func.functionName}`);
      }
      createdFunctions.push(created);
    }

    return [...existingFunctions, ...createdFunctions];
  }

  private showSuccessFeedback(): void {
    this.modalFeedbackSuccess = true;
    this.modalFeedbackMessage = '✅ Equipo registrado exitosamente.';
    this.showModalFeedback = true;

    setTimeout(() => {
      this.isSubmitting = false;
      this.showModalFeedback = false;
      this.showConfirmationModal = false;
      this.resetForm();
    }, 4000);
  }

  private showErrorFeedback(): void {
    this.modalFeedbackSuccess = false;
    this.modalFeedbackMessage = '❌ Error al registrar el equipo';
    this.showModalFeedback = true;
    this.isSubmitting = false;
  }

  // Utility Methods
  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  resetForm(): void {
    this.equipmentForm.reset({ availability: '', notes: '' });
    this.selectedBrandOrProposed = null;
    this.selectedLab = null;
    this.selectedFunctions = [];
    this.notesRequired = false;
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
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
}
