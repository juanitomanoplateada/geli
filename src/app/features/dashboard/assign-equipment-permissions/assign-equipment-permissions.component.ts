import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

// Components
import { DropdownSearchComponent } from '../../../shared/components/dropdown-search/dropdown-search.component';
import { SearchAdvancedComponent } from '../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableCheckboxComponent } from '../../../shared/components/results-table-checkbox/results-table-checkbox.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

// Models
import { FieldConfig } from '../../../shared/model/field-config.model';
import { ColumnConfig } from '../../../shared/model/column-config.model';
import { EquipmentDto } from '../../../core/dto/equipments-patterns/equipment-response.dto';
import { UserRecordResponse } from '../../../core/dto/user/record-user-response.dto';
import { EquipmentFilterDto } from '../../../core/dto/equipments-patterns/equipment-request.dto';

// Services
import { UserService } from '../../../core/services/user/user.service';
import { EquipmentService } from '../../../core/services/equipment/equipment.service';
import { BrandService } from '../../../core/services/brand/brand.service';
import { FunctionService } from '../../../core/services/function/function.service';
import { LaboratoryService } from '../../../core/services/laboratory/laboratory.service';

interface EquipmentTableRecord extends EquipmentDto {
  availabilityText: string;
  functionsText: string;
}

interface UserRecord {
  id: number;
  fullName: string;
  identification: string;
  email: string;
  role: string;
  status: string;
  position?: string;
  creationDate: string;
}

interface LaboratoryGroup {
  id: number;
  name: string;
  expanded: boolean;
  equipments: EquipmentTableRecord[];
  allSelected: boolean;
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
  // User related properties
  users: UserRecord[] = [];
  selectedUser: UserRecordResponse | null = null;
  userOptions: string[] = [];

  // Search related properties
  searchQuery = '';
  isLoading = false;
  showAdvancedSearch = false;
  hasSearched = false;
  filters: {
    availability?: 'ACTIVO' | 'INACTIVO' | '';
    function?: number;
    laboratory?: number;
    brand?: number;
  } = {
    availability: '',
    function: undefined,
    laboratory: undefined,
    brand: undefined,
  };

  // Configuration properties
  fieldsConfig: FieldConfig[] = [
    {
      key: 'brand',
      label: 'Marca',
      type: 'dropdown',
      allowEmptyOption: 'TODAS',
    },
    {
      key: 'laboratory',
      label: 'Laboratorio',
      type: 'dropdown',
      allowEmptyOption: 'TODOS',
    },
    {
      key: 'availability',
      label: 'Estado',
      type: 'select',
      options: ['ACTIVO', 'INACTIVO'],
      allowEmptyOption: 'TODOS',
    },
  ];

  columns: ColumnConfig[] = [
    { key: 'inventoryNumber', label: 'N° Inventario', type: 'text' },
    { key: 'equipmentName', label: 'Nombre', type: 'text' },
    { key: 'brand.brandName', label: 'Marca', type: 'text' },
    { key: 'laboratory.laboratoryName', label: 'Laboratorio', type: 'text' },
    { key: 'availabilityText', label: 'Estado', type: 'status' },
  ];

  availableFilterKeys = [
    { key: 'brand', label: 'Marca' },
    { key: 'laboratory', label: 'Laboratorio' },
    { key: 'availability', label: 'Estado' },
  ];
  activeFilterKeys = this.availableFilterKeys.map((f) => f.key);

  options: { [key: string]: { label: string; value: any }[] } = {
    availability: [
      { label: 'ACTIVO', value: true },
      { label: 'INACTIVO', value: false },
    ],
    function: [],
    laboratory: [],
    brand: [],
  };

  // Equipment related properties
  equipmentResults: EquipmentTableRecord[] = [];
  authorizedEquipments: EquipmentTableRecord[] = [];
  laboratoryGroups: LaboratoryGroup[] = [];
  showGroupedView = true;

  // Modal properties
  showConfirmModal = false;
  isModalProcessing = false;
  modalSuccessMessage = '';
  modalSuccessType: 'success' | 'error' | '' = '';

  // Loading states
  isInitialLoading = true;
  isLoadingEquipments = false;

  // Pagination properties
  currentPage = 0;
  totalPages = 0;
  pageSize = 25;
  pageSizeOptions = [25, 50, 100, 150, 300, 600, 1200];

  constructor(
    private userService: UserService,
    private equipmentService: EquipmentService,
    private brandService: BrandService,
    private functionService: FunctionService,
    private laboratoryService: LaboratoryService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  // Initialization methods
  private loadInitialData(): void {
    this.isInitialLoading = true;

    forkJoin({
      users: this.userService.filterUsers(
        { role: 'AUTHORIZED-USER', status: true },
        0,
        10000
      ),
      brands: this.brandService.getAll(),
      functions: this.functionService.getAll(),
      laboratories: this.laboratoryService.getLaboratories(),
    }).subscribe({
      next: ({ users, brands, functions, laboratories }) => {
        this.processInitialData(users, brands, functions, laboratories);
      },
      error: (err) => {
        console.error('Error al cargar datos iniciales:', err);
      },
      complete: () => {
        this.isInitialLoading = false;
      },
    });
  }

  private processInitialData(
    users: any,
    brands: any[],
    functions: any[],
    laboratories: any[]
  ): void {
    this.users = (users.content || []).map((u: any) => ({
      id: u.id,
      fullName: `${u.firstName} ${u.lastName}`,
      identification: u.identification,
      email: u.email,
      role: u.role,
      status: u.enabledStatus ? 'ACTIVO' : 'INACTIVO',
      position: u.position?.positionName || '—',
      creationDate: u.creationDate,
    }));
    this.userOptions = this.users.map((u) => u.fullName);

    this.options['brand'] = brands.map((b) => ({
      label: b.brandName,
      value: b.id,
    }));

    this.options['function'] = functions.map((f) => ({
      label: f.functionName,
      value: f.id,
    }));

    this.options['laboratory'] = laboratories.map((l) => ({
      label: l.laboratoryName,
      value: l.id,
    }));
  }

  // Pagination methods
  changePage(page: number): void {
    this.currentPage = page;
    this.performSearch();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.performSearch();
  }

  // User selection methods
  onUserSelect(userFullName: string): void {
    const selected = this.users.find((u) => u.fullName === userFullName);
    if (!selected) return;

    this.isLoadingEquipments = true;

    this.userService.getUserById(selected.id).subscribe({
      next: (user) => {
        this.handleUserSelection(user);
      },
      error: (err) => {
        console.error('Error al obtener usuario:', err);
        this.isLoadingEquipments = false;
      },
    });
  }

  private handleUserSelection(user: UserRecordResponse): void {
    this.selectedUser = user;
    this.authorizedEquipments = (user.authorizedUserEquipments ?? []).map(
      (eq) => ({
        ...eq,
        availabilityText: eq.availability ? 'ACTIVO' : 'INACTIVO',
        functionsText: Array.isArray(eq.functions)
          ? eq.functions.map((f) => f.functionName).join(', ')
          : '—',
      })
    );

    this.performSearch();
  }

  // Search methods
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
        this.filters.availability === 'ACTIVO'
          ? true
          : this.filters.availability === 'INACTIVO'
          ? false
          : undefined,
    };

    this.equipmentService
      .filterEquipments(filterPayload, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => this.handleSearchSuccess(response),
        error: (error) => this.handleSearchError(error),
      });
  }

  private handleSearchSuccess(response: any): void {
    const equipments = response.content || [];
    this.totalPages = response.totalPages || 0;

    const mapped: EquipmentTableRecord[] = equipments.map(
      (eq: EquipmentDto) => ({
        ...eq,
        availabilityText: eq.availability ? 'ACTIVO' : 'INACTIVO',
        functionsText:
          Array.isArray(eq.functions) && eq.functions.length > 0
            ? eq.functions.map((f) => f.functionName).join(', ')
            : '—',
      })
    );

    const authorizedMap = new Map<number, EquipmentTableRecord>(
      (this.authorizedEquipments ?? []).map((eq) => [eq.id, eq])
    );

    const visibleAuthorized = mapped.filter((eq) => authorizedMap.has(eq.id));
    const hiddenAuthorized = (this.authorizedEquipments ?? []).filter(
      (eq) => !mapped.some((res) => res.id === eq.id)
    );

    this.equipmentResults = mapped;
    this.authorizedEquipments = [...hiddenAuthorized, ...visibleAuthorized];

    this.groupEquipmentsByLaboratory();
    this.hasSearched = true;
    this.isLoading = false;
    this.isLoadingEquipments = false;
  }

  private handleSearchError(error: any): void {
    console.error('Error al buscar equipos:', error);
    this.equipmentResults = [];
    this.totalPages = 0;
    this.hasSearched = true;
    this.isLoading = false;
    this.isLoadingEquipments = false;
  }

  // Laboratory grouping methods
  private groupEquipmentsByLaboratory(): void {
    const labGroups = new Map<number, LaboratoryGroup>();

    this.equipmentResults.forEach((equipment) => {
      const labId = equipment.laboratory?.id;
      const labName = equipment.laboratory?.laboratoryName;

      if (labId && labName) {
        if (labGroups.has(labId)) {
          labGroups.get(labId)?.equipments.push(equipment);
        } else {
          labGroups.set(labId, {
            id: labId,
            name: labName,
            expanded: true,
            equipments: [equipment],
            allSelected: false,
          });
        }
      }
    });

    this.laboratoryGroups = Array.from(labGroups.values());
    this.updateGroupSelectionState();
  }

  toggleGroupExpansion(group: LaboratoryGroup): void {
    group.expanded = !group.expanded;
  }

  toggleGroupSelection(group: LaboratoryGroup): void {
    const newState = !group.allSelected;

    if (newState) {
      const currentIds = new Set(this.authorizedEquipments.map((eq) => eq.id));
      group.equipments.forEach((equipment) => {
        if (!currentIds.has(equipment.id)) {
          this.authorizedEquipments.push(equipment);
        }
      });
    } else {
      this.authorizedEquipments = this.authorizedEquipments.filter(
        (auth) => !group.equipments.some((eq) => eq.id === auth.id)
      );
    }

    group.allSelected = newState;
  }

  // View toggle methods
  toggleGroupedView(): void {
    this.showGroupedView = !this.showGroupedView;
  }

  // Equipment selection methods
  isChecked(equipment: EquipmentTableRecord): boolean {
    return this.authorizedEquipments.some((eq) => eq.id === equipment.id);
  }

  onItemCheckChange(item: EquipmentTableRecord): void {
    if (this.isChecked(item)) {
      this.authorizedEquipments = this.authorizedEquipments.filter(
        (eq) => eq.id !== item.id
      );
    } else {
      this.authorizedEquipments = [...this.authorizedEquipments, item];
    }

    this.updateGroupSelectionState();
  }

  private updateGroupSelectionState(): void {
    this.laboratoryGroups.forEach((group) => {
      const allEquipmentIds = new Set(group.equipments.map((eq) => eq.id));
      const selectedEquipmentIds = new Set(
        this.authorizedEquipments
          .filter((eq) => allEquipmentIds.has(eq.id))
          .map((eq) => eq.id)
      );

      group.allSelected =
        selectedEquipmentIds.size === allEquipmentIds.size &&
        allEquipmentIds.size > 0;
    });
  }

  // Utility methods
  resolveNestedValue(item: any, key: string): any {
    if (!key.includes('.')) {
      return item[key];
    }

    const parts = key.split('.');
    let value = item;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return '';
      }
    }

    return value || '';
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

  // Modal methods
  savePermissions(): void {
    this.showConfirmModal = true;
  }

  confirmSave(): void {
    if (!this.selectedUser) return;

    this.isModalProcessing = true;
    this.modalSuccessMessage = '';
    this.modalSuccessType = '';

    const payload = {
      userId: this.selectedUser.id,
      equipmentIds: this.authorizedEquipments.map((eq) => eq.id),
    };

    this.userService
      .updateAuthorizedEquipments(payload.userId, payload.equipmentIds)
      .subscribe({
        next: () => this.handleSaveSuccess(),
        error: (err) => this.handleSaveError(err),
      });
  }

  private handleSaveSuccess(): void {
    this.modalSuccessMessage = '✅ Permisos actualizados correctamente.';
    this.modalSuccessType = 'success';

    setTimeout(() => {
      this.isModalProcessing = false;
      this.showConfirmModal = false;
      this.modalSuccessMessage = '';
      this.modalSuccessType = '';
    }, 4000);
  }

  private handleSaveError(err: any): void {
    console.error('Error al guardar permisos:', err);
    this.modalSuccessMessage = '❌ Ocurrió un error al guardar los permisos.';
    this.modalSuccessType = 'error';
    this.isModalProcessing = false;
  }

  cancelSave(): void {
    this.showConfirmModal = false;
    this.modalSuccessMessage = '';
    this.modalSuccessType = '';
  }

  // Search control methods
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
    this.currentPage = 0;
    this.performSearch();
  }

  // Utility methods
  trackById(_: number, item: EquipmentDto): number {
    return item.id;
  }

  getUserLabel(user: UserRecordResponse): string {
    return `${user.firstName} ${user.lastName}`;
  }
}
