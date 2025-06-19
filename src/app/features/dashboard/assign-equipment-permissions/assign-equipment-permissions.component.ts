import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DropdownSearchComponent } from '../../../shared/components/dropdown-search/dropdown-search.component';
import { SearchAdvancedComponent } from '../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableCheckboxComponent } from '../../../shared/components/results-table-checkbox/results-table-checkbox.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

import { FieldConfig } from '../../../shared/model/field-config.model';
import { ColumnConfig } from '../../../shared/model/column-config.model';

import { UserRecordResponse } from '../../../core/dto/user/record-user-response.dto';
import { UserService } from '../../../core/services/user/user.service';
import { EquipmentService } from '../../../core/equipment/services/equipment.service';
import { EquipmentDto } from '../../../core/equipment/models/equipment-response.dto';
import { EquipmentFilterDto } from '../../../core/equipment/models/equipment-request.dto';
import { BrandService } from '../../../core/brand/services/brand.service';
import { FunctionService } from '../../../core/function/services/function.service';
import { LaboratoryService } from '../../../core/laboratory/services/laboratory.service';
import { forkJoin } from 'rxjs';

interface EquipmentTableRecord extends EquipmentDto {
  availabilityText: string;
  functionsText: string;
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
  users: UserRecordResponse[] = [];
  selectedUser: UserRecordResponse | null = null;
  userOptions: string[] = [];

  searchQuery = '';
  isLoading = false;
  showAdvancedSearch = false;
  hasSearched = false;

  modalSuccessMessage = '';

  modalSuccessType: 'success' | 'error' | '' = '';

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

  // Agrupación por laboratorio
  laboratoryGroups: LaboratoryGroup[] = [];
  showGroupedView = true; // por defecto mostrar vista agrupada

  // Confirm modal
  showConfirmModal = false;
  isModalProcessing = false;

  isInitialLoading = true; // loading inicial (usuarios y filtros)
  isLoadingEquipments = false; // loading de equipos cuando se selecciona usuario

  constructor(
    private userService: UserService,
    private equipmentService: EquipmentService,
    private brandService: BrandService,
    private functionService: FunctionService,
    private laboratoryService: LaboratoryService
  ) {}

  ngOnInit(): void {
    this.isInitialLoading = true;

    forkJoin({
      users: this.userService.getUsers(),
      brands: this.brandService.getAll(),
      functions: this.functionService.getAll(),
      laboratories: this.laboratoryService.getLaboratories(),
    }).subscribe({
      next: ({ users, brands, functions, laboratories }) => {
        // Usuarios
        this.users = (users ?? []).filter((u) => u.role === 'AUTHORIZED-USER');
        this.userOptions = this.users.map(
          (u) => `${u.firstName} ${u.lastName}`
        );

        // Marcas
        this.options['brand'] = brands.map((b) => ({
          label: b.brandName,
          value: b.id,
        }));

        // Funciones
        this.options['function'] = functions.map((f) => ({
          label: f.functionName,
          value: f.id,
        }));

        // Laboratorios
        this.options['laboratory'] = laboratories.map((l) => ({
          label: l.laboratoryName,
          value: l.id,
        }));
      },
      error: (err) => {
        console.error('Error al cargar datos iniciales:', err);
      },
      complete: () => {
        this.isInitialLoading = false;
      },
    });
  }

  onUserSelect(userFullName: string): void {
    const selected = this.users.find(
      (u) => `${u.firstName} ${u.lastName}` === userFullName
    );
    if (!selected) return;

    this.isLoadingEquipments = true;

    this.userService.getUserById(selected.id).subscribe({
      next: (user) => {
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
      },
      error: (err) => {
        console.error('Error al obtener usuario:', err);
        this.isLoadingEquipments = false;
      },
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

        // Agrupar por laboratorio después de actualizar los resultados
        this.groupEquipmentsByLaboratory();

        this.hasSearched = true;
        this.isLoading = false;
        this.isLoadingEquipments = false; // Actualizado: detener spinner de carga
      },
      error: (error) => {
        console.error('Error al buscar equipos:', error);
        this.equipmentResults = [];
        this.hasSearched = true;
        this.isLoading = false;
        this.isLoadingEquipments = false; // Actualizado: detener spinner en caso de error
      },
    });
  }

  // Método para agrupar equipos por laboratorio
  groupEquipmentsByLaboratory(): void {
    // Crear mapa de laboratorios
    const labGroups = new Map<number, LaboratoryGroup>();

    // Procesar cada equipo
    this.equipmentResults.forEach((equipment) => {
      const labId = equipment.laboratory?.id;
      const labName = equipment.laboratory?.laboratoryName;

      if (labId && labName) {
        // Si el laboratorio ya existe en el mapa, agregar equipo
        if (labGroups.has(labId)) {
          labGroups.get(labId)?.equipments.push(equipment);
        } else {
          // Si no existe, crear nuevo grupo de laboratorio
          labGroups.set(labId, {
            id: labId,
            name: labName,
            expanded: true, // Expandido por defecto
            equipments: [equipment],
            allSelected: false,
          });
        }
      }
    });

    // Convertir mapa a array
    this.laboratoryGroups = Array.from(labGroups.values());

    // Actualizar estado de selecciu00f3n para cada grupo
    this.updateGroupSelectionState();
  }

  // Método para alternar la expansión de un grupo
  toggleGroupExpansion(group: LaboratoryGroup): void {
    group.expanded = !group.expanded;
  }

  // Método para seleccionar/deseleccionar todos los equipos de un grupo
  toggleGroupSelection(group: LaboratoryGroup): void {
    const newState = !group.allSelected;

    if (newState) {
      // Seleccionar todos los equipos del grupo que no estén ya seleccionados
      const currentIds = new Set(this.authorizedEquipments.map((eq) => eq.id));

      group.equipments.forEach((equipment) => {
        if (!currentIds.has(equipment.id)) {
          this.authorizedEquipments.push(equipment);
        }
      });
    } else {
      // Deseleccionar todos los equipos del grupo
      this.authorizedEquipments = this.authorizedEquipments.filter((auth) => !group.equipments.some((eq) => eq.id === auth.id));
    }

    // Actualizar estado del grupo
    group.allSelected = newState;
  }

  // Método para alternar entre vista agrupada y vista plana
  toggleGroupedView(): void {
    this.showGroupedView = !this.showGroupedView;
  }

  // Método para verificar si un equipo está marcado como autorizado
  isChecked(equipment: EquipmentTableRecord): boolean {
    return this.authorizedEquipments.some((eq) => eq.id === equipment.id);
  }

  // Método para manejar el cambio de estado de un checkbox individual
  onItemCheckChange(item: EquipmentTableRecord): void {
    if (this.isChecked(item)) {
      // Si ya está seleccionado, eliminarlo
      this.authorizedEquipments = this.authorizedEquipments.filter(eq => eq.id !== item.id);
    } else {
      // Si no está seleccionado, añadirlo
      this.authorizedEquipments = [...this.authorizedEquipments, item];
    }

    // Actualizar estado de grupos
    this.updateGroupSelectionState();
  }

  // Método para actualizar el estado de selección de todos los grupos
  updateGroupSelectionState(): void {
    this.laboratoryGroups.forEach(group => {
      const allEquipmentIds = new Set(group.equipments.map(eq => eq.id));
      const selectedEquipmentIds = new Set(this.authorizedEquipments.filter(eq => allEquipmentIds.has(eq.id)).map(eq => eq.id));

      // Un grupo está totalmente seleccionado si todos sus equipos están seleccionados
      group.allSelected = selectedEquipmentIds.size === allEquipmentIds.size && allEquipmentIds.size > 0;
    });
  }

  // Método para obtener valores anidados de un objeto
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
    const preserved = this.authorizedEquipments.filter((eq) => checkedIds.has(eq.id));
    const newOnes = checked.filter((eq) => !preserved.some((e) => e.id === eq.id));
    this.authorizedEquipments = [...preserved, ...newOnes];
  }

  savePermissions(): void {
    this.showConfirmModal = true;
  }

  confirmSave(): void {
    if (!this.selectedUser) return;

    this.isModalProcessing = true;
    this.modalSuccessMessage = '';
    this.modalSuccessType = ''; // limpiar antes

    const payload = {
      userId: this.selectedUser.id,
      equipmentIds: this.authorizedEquipments.map((eq) => eq.id),
    };

    this.userService
      .updateAuthorizedEquipments(payload.userId, payload.equipmentIds)
      .subscribe({
        next: () => {
          this.modalSuccessMessage = 'Permisos actualizados correctamente ✅';
          this.modalSuccessType = 'success';

          setTimeout(() => {
            this.isModalProcessing = false;
            this.showConfirmModal = false;
            this.modalSuccessMessage = '';
            this.modalSuccessType = '';
          }, 4000);
        },
        error: (err) => {
          console.error('Error al guardar permisos:', err);
          this.modalSuccessMessage =
            'Ocurrió un error al guardar los permisos ❌';
          this.modalSuccessType = 'error';
          this.isModalProcessing = false;
        },
      });
  }

  cancelSave(): void {
    this.showConfirmModal = false;
    this.modalSuccessMessage = '';
    this.modalSuccessType = '';
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
