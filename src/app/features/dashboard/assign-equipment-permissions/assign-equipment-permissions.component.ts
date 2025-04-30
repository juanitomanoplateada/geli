import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchAdvancedComponent } from '../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableComponent } from '../../../shared/components/results-table/results-table.component';
import { DropdownFilterComponent } from '../../../shared/components/dropdown-filter/dropdown-filter.component';
import { FieldConfig } from '../../../shared/model/field-config.model';

interface Equipment {
  id: number;
  equipmentName: string;
  brand: string;
  inventoryNumber: string;
  laboratory: string;
  availability: boolean;
  functions: string[];
}

@Component({
  selector: 'app-assign-equipment-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchAdvancedComponent,
    ResultsTableComponent,
    DropdownFilterComponent,
  ],
  templateUrl: './assign-equipment-permissions.component.html',
  styleUrls: ['./assign-equipment-permissions.component.scss'],
})
export class AssignEquipmentPermissionsComponent implements OnInit {
  // Filtros
  query = '';
  filters = {
    laboratory: '',
    availability: '',
    function: '',
  };
  activeFilterKeys = ['laboratory', 'availability', 'function'];

  // Opciones fijas
  options = {
    laboratory: ['Lab Química', 'Lab Física', 'Lab Computo'],
    availability: ['Disponible', 'No disponible'],
    function: ['Análisis', 'Calibración', 'Medición'],
  };

  fieldsConfig = [
    {
      key: 'laboratory',
      label: 'Laboratorio',
      type: 'select',
      options: ['Lab Química', 'Lab Física', 'Lab Computo'],
      allowEmptyOption: 'Todos',
    },
    {
      key: 'availability',
      label: 'Disponibilidad',
      type: 'select',
      options: ['Disponible', 'No disponible'],
      allowEmptyOption: 'Todas',
    },
    {
      key: 'function',
      label: 'Función',
      type: 'select',
      options: ['Análisis', 'Calibración', 'Medición'],
      allowEmptyOption: 'Todas',
    },
  ];

  equipmentList: Equipment[] = [
    {
      id: 1,
      equipmentName: 'Espectrofotómetro',
      brand: 'Shimadzu',
      inventoryNumber: 'EQ-001',
      laboratory: 'Lab Química',
      availability: true,
      functions: ['Análisis'],
    },
    {
      id: 2,
      equipmentName: 'Multímetro Digital',
      brand: 'Fluke',
      inventoryNumber: 'EQ-002',
      laboratory: 'Lab Física',
      availability: false,
      functions: ['Medición'],
    },
    {
      id: 3,
      equipmentName: 'Balanza Analítica',
      brand: 'Ohaus',
      inventoryNumber: 'EQ-003',
      laboratory: 'Lab Química',
      availability: true,
      functions: ['Calibración'],
    },
  ];

  filteredEquipments: Equipment[] = [];
  selectedIds = new Set<number>();

  loading = false;
  showFilters = false;
  hasSearched = false;

  ngOnInit(): void {
    this.filteredEquipments = [...this.equipmentList];
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  resetSearch(): void {
    this.query = '';
    this.filters = {
      laboratory: '',
      availability: '',
      function: '',
    };
    this.activeFilterKeys = ['laboratory', 'availability', 'function'];
    this.performSearch();
  }

  onFiltersChange(updated: any) {
    this.filters = { ...this.filters, ...updated };
    this.performSearch();
  }

  performSearch(): void {
    this.hasSearched = true;
    const q = this.query.trim().toLowerCase();

    this.filteredEquipments = this.equipmentList.filter((e) => {
      return (
        (!q ||
          e.equipmentName.toLowerCase().includes(q) ||
          e.brand.toLowerCase().includes(q) ||
          e.inventoryNumber.toLowerCase().includes(q)) &&
        (!this.filters.laboratory ||
          e.laboratory === this.filters.laboratory) &&
        (!this.filters.availability ||
          (this.filters.availability === 'Disponible' && e.availability) ||
          (this.filters.availability === 'No disponible' && !e.availability)) &&
        (!this.filters.function || e.functions.includes(this.filters.function))
      );
    });
  }

  toggleEquipment(id: number): void {
    this.selectedIds.has(id)
      ? this.selectedIds.delete(id)
      : this.selectedIds.add(id);
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  columns = [
    { key: 'equipmentName', label: 'Equipo', type: 'text' },
    { key: 'brand', label: 'Marca', type: 'text' },
    { key: 'inventoryNumber', label: 'Inventario', type: 'text' },
    { key: 'laboratory', label: 'Laboratorio', type: 'text' },
    { key: 'availability', label: 'Disponibilidad', type: 'status' },
    { key: 'functions', label: 'Funciones', type: 'text' },
    { key: 'actions', label: 'Permiso', type: 'actions' },
  ];

  actionButtons = [
    {
      label: (row: any) =>
        this.isSelected(row.id) ? 'Quitar permiso' : 'Asignar permiso',
      action: (row: any) => this.toggleEquipment(row.id),
      color: (row: any) => (this.isSelected(row.id) ? 'danger' : 'success'),
    },
  ];

  trackById(_: number, e: Equipment) {
    return e.id;
  }
}
