import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DropdownSearchComponent } from '../../../shared/components/dropdown-search/dropdown-search.component';
import { SearchAdvancedComponent } from '../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableCheckboxComponent } from '../../../shared/components/results-table-checkbox/results-table-checkbox.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

import { FieldConfig } from '../../../shared/model/field-config.model';
import { ColumnConfig } from '../../../shared/model/column-config.model';

import { forkJoin } from 'rxjs';
import { EquipmentDto } from '../../../core/dto/equipments-patterns/equipment-response.dto';
import { UserRecordResponse } from '../../../core/dto/user/record-user-response.dto';
import { UserService } from '../../../core/services/user/user.service';
import { EquipmentService } from '../../../core/services/equipment/equipment.service';
import { BrandService } from '../../../core/services/brand/brand.service';
import { FunctionService } from '../../../core/services/function/function.service';
import { LaboratoryService } from '../../../core/services/laboratory/laboratory.service';
import { EquipmentFilterDto } from '../../../core/dto/equipments-patterns/equipment-request.dto';

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
  users: UserRecord[] = [];
  selectedUser: UserRecordResponse | null = null;
  userOptions: string[] = [];

  searchQuery = '';
  isLoading = false;
  showAdvancedSearch = false;
  hasSearched = false;

  modalSuccessMessage = '';

  modalSuccessType: 'success' | 'error' | '' = '';

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

  // Variables de paginación
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
    this.isInitialLoading = true;

    forkJoin({
      users: this.userService.filterUsers(
        { role: 'AUTHORIZED-USER', status: true }, // o un payload vacío: {}
        0, // página inicial
        10000 // tamaño de página suficientemente grande para traer todos
      ),
      brands: this.brandService.getAll(),
      functions: this.functionService.getAll(),
      laboratories: this.laboratoryService.getLaboratories(),
    }).subscribe({
      next: ({ users, brands, functions, laboratories }) => {
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

  changePage(page: number) {
    this.currentPage = page;
    this.performSearch();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 0;
    this.performSearch();
  }

  onUserSelect(userFullName: string): void {
    const selected = this.users.find((u) => u.fullName === userFullName);
    if (!selected) return;

    this.isLoadingEquipments = true;

    this.userService.getUserById(selected.id).subscribe({
      next: (user) => {
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
        this.filters.availability === 'ACTIVO'
          ? true
          : this.filters.availability === 'INACTIVO'
          ? false
          : undefined,
    };

    // Usar el método con paginación
    this.equipmentService
      .filterEquipments(filterPayload, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          const equipments = response.content || []; // Usar content de la respuesta paginada
          this.totalPages = response.totalPages || 0; // Actualizar total de páginas

          // Mapeo corregido con tipado explícito
          const mapped: EquipmentTableRecord[] = equipments.map(
            (eq: EquipmentDto) => ({
              ...eq,
              availabilityText: eq.availability ? 'ACTIVO' : 'INACTIVO', // Operador ternario corregido
              functionsText:
                Array.isArray(eq.functions) && eq.functions.length > 0
                  ? eq.functions.map((f) => f.functionName).join(', ')
                  : '—',
            })
          );

          // Mapeo corregido para authorizedMap
          const authorizedMap = new Map<number, EquipmentTableRecord>(
            (this.authorizedEquipments ?? []).map((eq) => [eq.id, eq])
          );

          const visibleAuthorized = mapped.filter((eq) =>
            authorizedMap.has(eq.id)
          );
          const hiddenAuthorized = (this.authorizedEquipments ?? []).filter(
            (eq) => !mapped.some((res) => res.id === eq.id)
          );

          this.equipmentResults = mapped;
          this.authorizedEquipments = [
            ...hiddenAuthorized,
            ...visibleAuthorized,
          ];

          this.groupEquipmentsByLaboratory();
          this.hasSearched = true;
          this.isLoading = false;
          this.isLoadingEquipments = false;
        },
        error: (error) => {
          console.error('Error al buscar equipos:', error);
          this.equipmentResults = [];
          this.totalPages = 0;
          this.hasSearched = true;
          this.isLoading = false;
          this.isLoadingEquipments = false;
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
      this.authorizedEquipments = this.authorizedEquipments.filter(
        (auth) => !group.equipments.some((eq) => eq.id === auth.id)
      );
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
      this.authorizedEquipments = this.authorizedEquipments.filter(
        (eq) => eq.id !== item.id
      );
    } else {
      // Si no está seleccionado, añadirlo
      this.authorizedEquipments = [...this.authorizedEquipments, item];
    }

    // Actualizar estado de grupos
    this.updateGroupSelectionState();
  }

  // Método para actualizar el estado de selección de todos los grupos
  updateGroupSelectionState(): void {
    this.laboratoryGroups.forEach((group) => {
      const allEquipmentIds = new Set(group.equipments.map((eq) => eq.id));
      const selectedEquipmentIds = new Set(
        this.authorizedEquipments
          .filter((eq) => allEquipmentIds.has(eq.id))
          .map((eq) => eq.id)
      );

      // Un grupo está totalmente seleccionado si todos sus equipos están seleccionados
      group.allSelected =
        selectedEquipmentIds.size === allEquipmentIds.size &&
        allEquipmentIds.size > 0;
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
          this.modalSuccessMessage = '✅ Permisos actualizados correctamente.';
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
            '❌ Ocurrió un error al guardar los permisos.';
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
    this.currentPage = 0;
    this.performSearch();
  }

  trackById(_: number, item: EquipmentDto): number {
    return item.id;
  }

  getUserLabel(user: UserRecordResponse): string {
    return `${user.firstName} ${user.lastName}`;
  }
}
