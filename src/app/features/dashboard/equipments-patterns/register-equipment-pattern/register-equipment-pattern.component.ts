import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UppercaseNospaceDirective } from '../../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

interface LabOption {
  id: string;
  name: string;
}

interface FunctionOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-register-equipment-pattern',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UppercaseDirective,
    UppercaseNospaceDirective,
    ConfirmModalComponent,
  ],
  templateUrl: './register-equipment-pattern.component.html',
  styleUrls: ['./register-equipment-pattern.component.scss'],
})
export class RegisterEquipmentPatternComponent implements OnInit {
  // Opciones de laboratorio y funciones
  labOptions: LabOption[] = [
    { id: '1', name: 'Laboratorio de Redes' },
    { id: '2', name: 'Laboratorio de Electrónica' },
  ];

  functionOptions: FunctionOption[] = [
    { id: '1', name: 'Procesamiento de datos' },
    { id: '2', name: 'Control de dispositivos' },
    { id: 'na', name: 'N/A' },
  ];

  // Estado del formulario
  equipmentForm = this.fb.group({
    inventoryCode: ['', Validators.required],
    name: ['', Validators.required],
    brand: ['', Validators.required],
    labLocation: ['', Validators.required],
    availability: [true, Validators.required],
    functionId: ['', Validators.required], // validación simbólica
  });

  // Estado visual y dinámico
  isInventoryCodeTaken = false;
  showConfirmationModal = false;

  selectedLabName = '';
  selectedFunctions: FunctionOption[] = [];

  labSearchTerm = '';
  functionSearchTerm = '';

  filteredLabOptions: LabOption[] = [];
  filteredFunctionOptions: FunctionOption[] = [];

  labDropdownOpen = false;
  functionDropdownOpen = false;

  existingInventoryCodes: string[] = ['PAT-001', 'EQP-100'];

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.filteredLabOptions = this.labOptions;
    this.filteredFunctionOptions = this.functionOptions;

    this.equipmentForm.get('inventoryCode')?.valueChanges.subscribe((value) => {
      const code = (value ?? '').trim();
      this.isInventoryCodeTaken = this.existingInventoryCodes.includes(code);
    });

    this.equipmentForm.get('labLocation')?.valueChanges.subscribe((val) => {
      const selected = this.labOptions.find((opt) => opt.id === val);
      this.selectedLabName = selected?.name || '';
    });

    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('click', this.handleOutsideClick.bind(this));
    }
  }

  // === Lógica dropdown laboratorio ===
  toggleLabDropdown(): void {
    this.labDropdownOpen = !this.labDropdownOpen;
  }

  handleLabInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.labSearchTerm = value;
    this.filteredLabOptions = this.labOptions.filter((lab) =>
      lab.name.toLowerCase().includes(value)
    );
  }

  onSelectLab(lab: LabOption): void {
    this.equipmentForm.patchValue({ labLocation: lab.id });
    this.selectedLabName = lab.name;
    this.labSearchTerm = '';
    this.filteredLabOptions = this.labOptions;
    this.labDropdownOpen = false;
  }

  // === Lógica dropdown de funciones múltiples ===
  toggleFunctionDropdown(): void {
    this.functionDropdownOpen = !this.functionDropdownOpen;
  }

  handleFunctionSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.functionSearchTerm = value;
    this.filteredFunctionOptions = this.functionOptions.filter((func) =>
      func.name.toLowerCase().includes(value)
    );
  }

  onSelectFunction(func: FunctionOption): void {
    if (func.name === 'N/A') {
      this.selectedFunctions = [func];
    } else {
      const exists = this.selectedFunctions.some((f) => f.id === func.id);
      if (!exists) {
        this.selectedFunctions = this.selectedFunctions.filter(
          (f) => f.name !== 'N/A'
        );
        this.selectedFunctions.push(func);
      }
    }

    this.functionSearchTerm = '';
    this.filteredFunctionOptions = this.functionOptions;
    this.functionDropdownOpen = false;
    this.equipmentForm.patchValue({ functionId: 'valid' });
  }

  removeFunction(func: FunctionOption): void {
    this.selectedFunctions = this.selectedFunctions.filter(
      (f) => f.id !== func.id
    );
    if (this.selectedFunctions.length === 0) {
      this.equipmentForm.patchValue({ functionId: '' });
    }
  }

  // === Modal de confirmación ===
  onSubmit(): void {
    if (this.equipmentForm.valid && !this.isInventoryCodeTaken) {
      this.showConfirmationModal = true;
    }
  }

  confirmSubmission(): void {
    console.log('Formulario confirmado:', {
      ...this.equipmentForm.value,
      selectedFunctions: this.selectedFunctions,
    });
    this.showConfirmationModal = false;
    this.onCancel();
  }

  cancelSubmission(): void {
    this.showConfirmationModal = false;
  }

  get formSummary() {
    const values = this.equipmentForm.value;
    return {
      ...values,
      labName:
        this.labOptions.find((l) => l.id === values.labLocation)?.name || '',
      functions: this.selectedFunctions.map((f) => f.name).join(', '),
    };
  }

  // === Cancelar ===
  onCancel(): void {
    this.equipmentForm.reset({ availability: true });
    this.selectedLabName = '';
    this.labSearchTerm = '';
    this.functionSearchTerm = '';
    this.selectedFunctions = [];
    this.filteredLabOptions = this.labOptions;
    this.filteredFunctionOptions = this.functionOptions;
  }

  // === Cierre global de dropdowns ===
  handleOutsideClick(event: MouseEvent): void {
    const path = event.composedPath();
    const clickedInside = path.some((el) =>
      (el as HTMLElement)?.classList?.contains('custom-select')
    );
    if (!clickedInside) {
      this.labDropdownOpen = false;
      this.functionDropdownOpen = false;
    }
  }
}
