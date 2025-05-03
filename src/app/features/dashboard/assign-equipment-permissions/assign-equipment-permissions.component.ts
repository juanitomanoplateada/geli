import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DropdownSearchComponent } from '../../../shared/components/dropdown-search/dropdown-search.component';
import { SearchAdvancedComponent } from '../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableCheckboxComponent } from '../../../shared/components/results-table-checkbox/results-table-checkbox.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

import { FieldConfig } from '../../../shared/model/field-config.model';
import { ColumnConfig } from '../../../shared/model/column-config.model';

import {
  UserService,
  UserRecordResponse,
} from '../../../core/user/services/user.service';
import { EquipmentService } from '../../../core/equipment/services/equipment.service';
import { EquipmentDto } from '../../../core/equipment/models/equipment-response.dto';
import { EquipmentFilterDto } from '../../../core/equipment/models/equipment-request.dto';
import { BrandService } from '../../../core/brand/services/brand.service';
import { FunctionService } from '../../../core/function/services/function.service';
import { LaboratoryService } from '../../../core/laboratory/services/laboratory.service';

interface EquipmentTableRecord extends EquipmentDto {
  availabilityText: string;
  functionsText: string;
}

@Component({
  selector: 'app-assign-equipment-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownSearchComponent,
    SearchAdvancedComponent,
    ResultsTableCheckboxComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './assign-equipment-permissions.component.html',
  styleUrls: ['./assign-equipment-permissions.component.scss'],
})
export class AssignEquipmentPermissionsComponent implements OnInit {
  users: UserRecordResponse[] = [];
  selectedUser: UserRecordResponse | null = null;
  userOptions: string[] = [];

  searchQuery = '';
  isLoading = false;
  showAdvancedSearch = false;
  hasSearched = false;

  modalSuccessMessage = ''; // ✅ mensaje visible en el modal

  filters: {
    availability?: 'Activo' | 'Inactivo' | '';
    function?: number;
    laboratory?: number;
    brand?: number;
  } = {
    availability: '',
    function: undefined,
    laboratory: undefined,
    brand: undefined,
  };

  fieldsConfig: FieldConfig[] = [
    {
      key: 'brand',
      label: 'Marca',
      type: 'dropdown',
      allowEmptyOption: 'Todas',
    },
    {
      key: 'function',
      label: 'Función',
      type: 'dropdown',
      allowEmptyOption: 'Todas',
    },
    {
      key: 'laboratory',
      label: 'Laboratorio',
      type: 'dropdown',
      allowEmptyOption: 'Todos',
    },
    {
      key: 'availability',
      label: 'Estado',
      type: 'select',
      options: ['Activo', 'Inactivo'],
      allowEmptyOption: 'Todos',
    },
  ];

  columns: ColumnConfig[] = [
    { key: 'inventoryNumber', label: 'N° Inventario', type: 'text' },
    { key: 'equipmentName', label: 'Nombre', type: 'text' },
    { key: 'brand.brandName', label: 'Marca', type: 'text' },
    { key: 'laboratory.laboratoryName', label: 'Laboratorio', type: 'text' },
    { key: 'functionsText', label: 'Funciones', type: 'text' },
    { key: 'availabilityText', label: 'Estado', type: 'status' },
  ];

  availableFilterKeys = [
    { key: 'brand', label: 'Marca' },
    { key: 'function', label: 'Función' },
    { key: 'laboratory', label: 'Laboratorio' },
    { key: 'availability', label: 'Estado' },
  ];
  activeFilterKeys = this.availableFilterKeys.map((f) => f.key);

  options: { [key: string]: { label: string; value: any }[] } = {
    availability: [
      { label: 'Activo', value: true },
      { label: 'Inactivo', value: false },
    ],
    function: [],
    laboratory: [],
    brand: [],
  };

  equipmentResults: EquipmentTableRecord[] = [];
  authorizedEquipments: EquipmentTableRecord[] = [];

  // Confirm modal
  showConfirmModal = false;
  isModalProcessing = false;

  constructor(
    private userService: UserService,
    private equipmentService: EquipmentService,
    private brandService: BrandService,
    private functionService: FunctionService,
    private laboratoryService: LaboratoryService
  ) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((users) => {
      this.users = users.filter((u) => u.role === 'AUTHORIZED-USER'); // 👈 solo los del rol deseado
      this.userOptions = this.users.map((u) => `${u.firstName} ${u.lastName}`);
    });

    this.brandService.getAll().subscribe((brands) => {
      this.options['brand'] = brands.map((b) => ({
        label: b.brandName,
        value: b.id,
      }));
    });

    this.functionService.getAll().subscribe((funcs) => {
      this.options['function'] = funcs.map((f) => ({
        label: f.functionName,
        value: f.id,
      }));
    });

    this.laboratoryService.getLaboratories().subscribe((labs) => {
      this.options['laboratory'] = labs.map((l) => ({
        label: l.laboratoryName,
        value: l.id,
      }));
    });
  }

  onUserSelect(userFullName: string): void {
    const selected = this.users.find(
      (u) => `${u.firstName} ${u.lastName}` === userFullName
    );
    if (!selected) return;

    this.userService.getUserById(selected.id).subscribe((user) => {
      this.selectedUser = user;
      this.authorizedEquipments = (user.authorizedUserEquipments ?? []).map(
        (eq) => ({
          ...eq,
          availabilityText: eq.availability ? 'Activo' : 'Inactivo',
          functionsText: Array.isArray(eq.functions)
            ? eq.functions.map((f) => f.functionName).join(', ')
            : '—',
        })
      );

      this.performSearch();
    });
  }

  performSearch(): void {
    if (!this.selectedUser) return;

    this.isLoading = true;
    this.hasSearched = false;

    const filterPayload: EquipmentFilterDto = {
      equipmentName: this.searchQuery.trim() || undefined,
      brandId: this.filters.brand,
      functionId: this.filters.function,
      laboratoryId: this.filters.laboratory,
      availability:
        this.filters.availability === 'Activo'
          ? true
          : this.filters.availability === 'Inactivo'
          ? false
          : undefined,
    };

    this.equipmentService.filter(filterPayload).subscribe({
      next: (equipments) => {
        const safeEquipments = equipments ?? []; // Evita null
        const mapped: EquipmentTableRecord[] = safeEquipments.map((eq) => ({
          ...eq,
          availabilityText: eq.availability ? 'Activo' : 'Inactivo',
          functionsText:
            Array.isArray(eq.functions) && eq.functions.length > 0
              ? eq.functions.map((f) => f.functionName).join(', ')
              : '—',
        }));

        const authorizedMap = new Map(
          (this.authorizedEquipments ?? []).map((eq) => [eq.id, eq])
        );

        const visibleAuthorized = mapped.filter((eq) =>
          authorizedMap.has(eq.id)
        );
        const hiddenAuthorized = (this.authorizedEquipments ?? []).filter(
          (eq) => !mapped.some((res) => res.id === eq.id)
        );

        this.equipmentResults = mapped;
        this.authorizedEquipments = [...hiddenAuthorized, ...visibleAuthorized];
        this.hasSearched = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al buscar equipos:', err);
        this.equipmentResults = [];
        this.hasSearched = true;
        this.isLoading = false;
      },
    });
  }

  updateAuthorizedEquipments(checked: EquipmentTableRecord[]): void {
    const checkedIds = new Set(checked.map((eq) => eq.id));
    const preserved = this.authorizedEquipments.filter((eq) =>
      checkedIds.has(eq.id)
    );
    const newOnes = checked.filter(
      (eq) => !preserved.some((e) => e.id === eq.id)
    );
    this.authorizedEquipments = [...preserved, ...newOnes];
  }

  savePermissions(): void {
    this.showConfirmModal = true;
  }

  confirmSave(): void {
    if (!this.selectedUser) return;

    this.isModalProcessing = true;
    this.modalSuccessMessage = ''; // Limpiar antes de procesar

    const payload = {
      userId: this.selectedUser.id,
      equipmentIds: this.authorizedEquipments.map((eq) => eq.id),
    };

    this.userService
      .updateAuthorizedEquipments(payload.userId, payload.equipmentIds)
      .subscribe({
        next: () => {
          this.modalSuccessMessage = 'Permisos actualizados correctamente ✅';

          setTimeout(() => {
            this.isModalProcessing = false;
            this.showConfirmModal = false;
            this.modalSuccessMessage = '';
          }, 4000); // ⏳ 4 segundos visibles
        },
        error: (err) => {
          console.error('Error al guardar permisos:', err);
          this.isModalProcessing = false;
        },
      });
  }

  cancelSave(): void {
    this.showConfirmModal = false;
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.filters = {
      availability: '',
      function: undefined,
      laboratory: undefined,
      brand: undefined,
    };
    this.equipmentResults = [];
    this.hasSearched = false;
    this.performSearch();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  onFiltersChange(updatedFilters: any): void {
    this.filters = { ...this.filters, ...updatedFilters };
    this.performSearch();
  }

  trackById(_: number, item: EquipmentDto): number {
    return item.id;
  }

  getUserLabel(user: UserRecordResponse): string {
    return `${user.firstName} ${user.lastName}`;
  }
}
