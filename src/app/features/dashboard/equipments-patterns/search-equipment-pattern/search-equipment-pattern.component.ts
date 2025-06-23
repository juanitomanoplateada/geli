import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LaboratoryService } from '../../../../core/services/laboratory/laboratory.service';

import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableComponent } from '../../../../shared/components/results-table/results-table.component';

import { ColumnConfig } from '../../../../shared/model/column-config.model';
import { FieldConfig } from '../../../../shared/model/field-config.model';
import { BrandService } from '../../../../core/services/brand/brand.service';
import { FunctionService } from '../../../../core/services/function/function.service';
import { EquipmentService } from '../../../../core/services/equipment/equipment.service';
import { FunctionDto } from '../../../../core/dto/function/function-response.dto';
import { BrandDto } from '../../../../core/dto/brand/brand-response.dto';
import { EquipmentDto } from '../../../../core/dto/equipments-patterns/equipment-response.dto';

interface EquipmentRecord {
  id: number;
  name: string;
  function: string;
  laboratory: string;
  availability: string;
  brand: string;
  inventoryCode: string;
  notes: string;
}

interface Filters {
  availability: '' | 'ACTIVO' | 'INACTIVO';
  function?: number;
  laboratory?: number;
  brand?: number;
}

@Component({
  selector: 'app-search-equipment-pattern',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchAdvancedComponent,
    ResultsTableComponent,
  ],
  templateUrl: './search-equipment-pattern.component.html',
  styleUrls: ['./search-equipment-pattern.component.scss'],
})
export class SearchEquipmentPatternComponent implements OnInit {
  searchQuery = '';
  isLoading = false;
  showAdvancedSearch = false;
  hasSearched = false;

  filters: Filters = {
    availability: '',
    function: undefined,
    laboratory: undefined,
    brand: undefined,
  };

  lastQuery = '';
  lastFilters: Filters = { ...this.filters };

  equipmentResults: EquipmentRecord[] = [];

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
    { key: 'inventoryCode', label: 'N° Inventario', type: 'text' },
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'brand', label: 'Marca', type: 'text' },
    { key: 'laboratory', label: 'Laboratorio', type: 'text' },
    { key: 'availability', label: 'Estado', type: 'status' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  availableFilterKeys = [
    { key: 'brand', label: 'Marca' },
    { key: 'laboratory', label: 'Laboratorio' },
    { key: 'availability', label: 'Disponibilidad' },
  ];
  activeFilterKeys = this.availableFilterKeys.map((f) => f.key);

  options: { [key: string]: any[] } = {
    brand: [],
    function: [],
    laboratory: [],
  };

  noResults = false;

  // Variables de paginación
  currentPage = 0;
  totalPages = 0;
  pageSize = 5;
  pageSizeOptions = [5, 15, 30, 50, 100];

  constructor(
    private router: Router,
    private brandService: BrandService,
    private functionService: FunctionService,
    private laboratoryService: LaboratoryService,
    private equipmentService: EquipmentService
  ) {}

  ngOnInit(): void {
    this.loadDropdownOptions();
    this.performSearch();
  }

  private loadDropdownOptions(): void {
    this.brandService.getAll().subscribe({
      next: (res) => {
        this.options['brand'] = Array.isArray(res)
          ? res.map((b: BrandDto) => ({
              label: b.brandName,
              value: b.id,
            }))
          : [];
      },
      error: () => (this.options['brand'] = []),
    });

    this.functionService.getAll().subscribe({
      next: (res) => {
        this.options['function'] = Array.isArray(res)
          ? res.map((f: FunctionDto) => ({
              label: f.functionName,
              value: f.id,
            }))
          : [];
      },
      error: () => (this.options['function'] = []),
    });

    this.laboratoryService.getLaboratories().subscribe({
      next: (res) => {
        this.options['laboratory'] = Array.isArray(res)
          ? res.map((l) => ({
              label: l.laboratoryName,
              value: l.id,
            }))
          : [];
      },
      error: () => (this.options['laboratory'] = []),
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

  onFiltersChange(updated: Partial<Filters>) {
    this.filters = { ...this.filters, ...updated };
    this.currentPage = 0;
    this.performSearch();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
    if (!this.showAdvancedSearch) this.resetSearch();
  }

  performSearch(): void {
    this.isLoading = true;

    const payload = {
      equipmentName: this.searchQuery.trim() || undefined,
      brandId: this.filters.brand,
      laboratoryId: this.filters.laboratory,
      availability:
        this.filters.availability === 'ACTIVO'
          ? true
          : this.filters.availability === 'INACTIVO'
          ? false
          : undefined,
      functionId: this.filters.function,
    };

    this.equipmentService
      .filterEquipments(payload, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.lastQuery = this.searchQuery.trim();
          this.lastFilters = { ...this.filters };
          this.hasSearched = true;

          this.equipmentResults = (res.content || []).map(
            (eq: EquipmentDto) => ({
              id: eq.id,
              name: eq.equipmentName,
              inventoryCode: eq.inventoryNumber,
              brand: eq.brand?.brandName || '—',
              function:
                eq.functions?.map((f) => f.functionName).join(', ') || '—',
              laboratory: eq.laboratory?.laboratoryName || '—',
              availability: eq.availability ? 'ACTIVO' : 'INACTIVO',
              notes: eq.equipmentObservations || '—',
            })
          );

          this.totalPages = res.totalPages || 0;
          this.noResults = !res.content?.length;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al buscar equipos:', err);
          this.equipmentResults = [];
          this.hasSearched = true;
          this.isLoading = false;
          this.totalPages = 0;
          this.noResults = true;
        },
      });
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.filters = {
      availability: '',
      function: undefined,
      laboratory: undefined,
      brand: undefined,
    };
    this.activeFilterKeys = [...this.availableFilterKeys.map((f) => f.key)];
    this.performSearch();
  }

  buildNoResultsMessage(): string {
    const parts: string[] = [];

    if (this.lastQuery)
      parts.push(`nombre o inventario con "${this.lastQuery.toUpperCase()}"`);
    if (this.lastFilters.availability)
      parts.push(`disponibilidad "${this.lastFilters.availability}"`);
    if (this.lastFilters.function) {
      const match = this.options['function'].find(
        (f) => f.value === this.lastFilters.function
      );
      parts.push(`función "${match?.label || this.lastFilters.function}"`);
    }
    if (this.lastFilters.laboratory) {
      const match = this.options['laboratory'].find(
        (l) => l.value === this.lastFilters.laboratory
      );
      parts.push(
        `laboratorio "${match?.label || this.lastFilters.laboratory}"`
      );
    }
    if (this.lastFilters.brand) {
      const match = this.options['brand'].find(
        (b) => b.value === this.lastFilters.brand
      );
      parts.push(`marca "${match?.label || this.lastFilters.brand}"`);
    }

    return parts.length
      ? `No se encontraron equipos con ${parts.join(', ')}.`
      : 'No se encontraron equipos.';
  }

  navigateToEdit(id: number): void {
    this.router.navigate([
      '/dashboard/equipments-patterns/update-equipment',
      id,
    ]);
  }

  trackById(_: number, eq: EquipmentRecord) {
    return eq.id;
  }

  actionButtons = [
    {
      label: 'Editar',
      action: (eq: EquipmentRecord) => this.navigateToEdit(eq.id),
      color: 'primary',
    },
  ];
}
