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
import { UppercaseNospaceDirective } from '../../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { DropdownSearchEntityComponent } from '../../../../shared/components/dropdown-search-entity/dropdown-search-entity.component';
import { DropdownSearchEntityObjComponent } from './../../../../shared/components/dropdown-search-entity-obj/dropdown-search-entity-obj.component';
import { TagMultiselectComponent } from '../../../../shared/components/tag-multiselect/tag-multiselect.component';

import { EquipmentService } from '../../../../core/equipment/services/equipment.service';
import { BrandService } from '../../../../core/brand/services/brand.service';
import { LaboratoryService } from '../../../../core/laboratory/services/laboratory.service';
import {
  FunctionService,
  FunctionDto,
} from '../../../../core/function/services/function.service';

@Component({
  selector: 'app-update-equipment-pattern',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UppercaseDirective,
    UppercaseNospaceDirective,
    ConfirmModalComponent,
    DropdownSearchEntityObjComponent
],
  templateUrl: './update-equipment-pattern.component.html',
  styleUrls: ['./update-equipment-pattern.component.scss'],
})
export class UpdateEquipmentPatternComponent implements OnInit {
  equipmentForm: FormGroup;
  id!: number;

  isSubmitting = false;
  showConfirmationModal = false;
  showModalFeedback = false;
  modalFeedbackMessage = '';
  modalFeedbackSuccess = false;
  notesRequired = false;

  brandOptions: { label: string; value: string }[] = [];
  labOptions: { label: string; value: string }[] = [];
  availableFunctions: FunctionDto[] = [];
  selectedFunctions: FunctionDto[] = [];

  selectedBrandOrProposed: string | null = null;
  selectedLab: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private equipmentService: EquipmentService,
    private brandService: BrandService,
    private laboratoryService: LaboratoryService,
    private functionService: FunctionService,
    private router: Router
  ) {
    this.equipmentForm = this.fb.group({
      inventoryCode: [{ value: '', disabled: true }],
      name: [{ value: '', disabled: true }],
      brand: [{ value: '', disabled: true }],
      lab: ['', Validators.required],
      availability: ['', Validators.required],
      notes: [''],
      functionId: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.brandService.getAll().subscribe((brands) => {
      this.brandOptions = brands.map((b) => ({
        label: b.brandName,
        value: b.id.toString(),
      }));
    });

    this.laboratoryService.getLaboratories().subscribe((labs) => {
      this.labOptions = labs
        .filter((l) => l.id != null)
        .map((l) => ({ label: l.laboratoryName, value: l.id!.toString() }));
    });

    this.functionService.getAll().subscribe((functions) => {
      const hasNA = functions.some(
        (f) => f.functionName.toUpperCase() === 'N/A'
      );
      this.availableFunctions = hasNA
        ? functions
        : [...functions, { id: 0, functionName: 'N/A' }];
    });

    this.loadEquipment();
  }

  loadEquipment(): void {
    this.equipmentService.getById(this.id).subscribe((equipment) => {
      this.selectedBrandOrProposed = equipment.brand.brandName;
      this.selectedLab = equipment.laboratory.id.toString();
      this.selectedFunctions = equipment.functions;

      this.equipmentForm.patchValue({
        inventoryCode: equipment.inventoryNumber,
        name: equipment.equipmentName,
        brand: equipment.brand.id.toString(),
        lab: equipment.laboratory.id.toString(),
        availability: equipment.availability ? 'ACTIVO' : 'INACTIVO',
        notes: equipment.equipmentObservations || '',
        functionId: 'valid',
      });

      this.notesRequired = !equipment.availability;
    });
  }

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
      notesControl?.setValue(''); // ← limpiar el campo si es ACTIVO
    }

    notesControl?.updateValueAndValidity();
  }

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
      const payload = {
        laboratoryId: Number(this.equipmentForm.get('lab')?.value),
        availability:
          this.equipmentForm.get('availability')?.value === 'ACTIVO',
        equipmentObservations: this.equipmentForm.get('notes')?.value || '',
      };

      await this.equipmentService.update(this.id, payload).toPromise();

      this.modalFeedbackSuccess = true;
      this.modalFeedbackMessage = '✅ Equipo actualizado exitosamente.';
      this.showModalFeedback = true;

      setTimeout(() => {
        this.isSubmitting = false;
        this.showModalFeedback = false;
        this.showConfirmationModal = false;
      }, 4000);
    } catch (error) {
      this.modalFeedbackSuccess = false;
      this.modalFeedbackMessage = '❌ Error al actualizar el equipo';
      this.showModalFeedback = true;
      this.isSubmitting = false;
    }
  }

  get formSummary() {
    const rawValues = this.equipmentForm.getRawValue(); // <-- cambio clave
    return {
      inventoryCode: rawValues.inventoryCode || '(Sin código)',
      name: rawValues.name || '(Sin nombre)',
      brand: this.selectedBrandOrProposed,
      functions:
        this.selectedFunctions.map((f) => f.functionName).join(', ') ||
        '(Sin funciones)',
      lab:
        this.labOptions.find((l) => l.value === this.selectedLab)?.label ||
        '(Sin laboratorio)',
      availability: rawValues.availability || '(Sin estado)',
      notes: rawValues.notes || '(Sin observaciones)',
    };
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  goBack(): void {
    this.router.navigate([
      '/dashboard/equipments-patterns/search-equipment-pattern',
    ]);
  }
}
