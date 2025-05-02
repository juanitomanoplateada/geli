import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DropdownSearchComponent } from '../../../shared/components/dropdown-search/dropdown-search.component';
import { SearchAdvancedComponent } from '../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableCheckboxComponent } from '../../../shared/components/results-table-checkbox/results-table-checkbox.component';

import { FieldConfig } from '../../../shared/model/field-config.model';
import { ColumnConfig } from '../../../shared/model/column-config.model';

interface EquipmentRecord {
  id: number;
  name: string;
  function: string;
  laboratory: string;
  availability: string;
  brand: string;
  inventoryCode: string;
  [key: string]: any; // acceso dinámico para columnas
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
  ],
  templateUrl: './assign-equipment-permissions.component.html',
  styleUrls: ['./assign-equipment-permissions.component.scss'],
})
export class AssignEquipmentPermissionsComponent implements OnInit {
  // Opciones de usuarios
  userOptions = ['Ana Pérez', 'Luis Gómez', 'Carlos Rivera'];
  selectedUser: string | null = null;

  // Estado de búsqueda
  searchQuery = '';
  isLoading = false;
  showAdvancedSearch = false;
  hasSearched = false;

  // Filtros
  filters: any = {
    availability: '',
    function: '',
    laboratory: '',
    brand: '',
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
      allowEmptyOption: 'Todas',
    },
    {
      key: 'availability',
      label: 'Disponibilidad',
      type: 'select',
      options: ['Disponible', 'No disponible'],
      allowEmptyOption: 'Todas',
    },
  ];

  columns: ColumnConfig[] = [
    { key: 'inventoryCode', label: 'N° Inventario', type: 'text' },
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'brand', label: 'Marca', type: 'text' },
    { key: 'function', label: 'Función', type: 'text' },
    { key: 'laboratory', label: 'Laboratorio', type: 'text' },
    { key: 'availability', label: 'Disponibilidad', type: 'status' },
  ];

  availableFilterKeys = [
    { key: 'brand', label: 'Marca' },
    { key: 'function', label: 'Función' },
    { key: 'laboratory', label: 'Laboratorio' },
    { key: 'availability', label: 'Disponibilidad' },
  ];
  activeFilterKeys = this.availableFilterKeys.map((f) => f.key);

  options: { [key: string]: any[] } = {
    availability: ['Disponible', 'No disponible'],
    function: ['Medición', 'Calibración', 'Análisis'],
    laboratory: ['Lab Física', 'Lab Química', 'Lab Electrónica'],
    brand: ['Fluke', 'Keysight', 'Agilent'],
  };

  // Resultados
  equipmentResults: EquipmentRecord[] = [];
  authorizedEquipments: EquipmentRecord[] = [];

  constructor() {}

  ngOnInit(): void {}

  onUserSelect(user: string): void {
    this.selectedUser = user;
    this.performSearch();
  }

  onFiltersChange(updatedFilters: any): void {
    this.filters = { ...this.filters, ...updatedFilters };
    this.performSearch();
  }

  performSearch(): void {
    this.isLoading = true;

    // Simulación de resultados
    const mockResults: EquipmentRecord[] = [
      {
        id: 1,
        name: 'Multímetro',
        function: 'Medición',
        laboratory: 'Lab Electrónica',
        availability: 'Disponible',
        brand: 'Fluke',
        inventoryCode: 'EQ-001',
      },
      {
        id: 2,
        name: 'Osciloscopio',
        function: 'Calibración',
        laboratory: 'Lab Física',
        availability: 'No disponible',
        brand: 'Keysight',
        inventoryCode: 'EQ-002',
      },
      {
        id: 3,
        name: 'Espectrofotómetro',
        function: 'Análisis',
        laboratory: 'Lab Química',
        availability: 'Disponible',
        brand: 'Agilent',
        inventoryCode: 'EQ-003',
      },
    ];

    const query = this.searchQuery.trim().toLowerCase();
    const { availability, function: func, laboratory, brand } = this.filters;

    setTimeout(() => {
      this.equipmentResults = mockResults.filter((eq) => {
        const matchQuery =
          !query ||
          eq.name.toLowerCase().includes(query) ||
          eq.inventoryCode.toLowerCase().includes(query);
        const matchAvailability =
          !availability || eq.availability === availability;
        const matchFunction = !func || eq.function === func;
        const matchLab = !laboratory || eq.laboratory === laboratory;
        const matchBrand = !brand || eq.brand === brand;

        return (
          matchQuery &&
          matchAvailability &&
          matchFunction &&
          matchLab &&
          matchBrand
        );
      });

      this.hasSearched = true;
      this.isLoading = false;
    }, 300);
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.filters = {
      availability: '',
      function: '',
      laboratory: '',
      brand: '',
    };
    this.performSearch();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  updateAuthorizedEquipments(equipments: EquipmentRecord[]): void {
    this.authorizedEquipments = [...equipments];
  }

  savePermissions(): void {
    if (!this.selectedUser) return;

    const payload = {
      user: this.selectedUser,
      authorizedEquipments: this.authorizedEquipments.map((eq) => eq.id),
    };

    console.log('Permisos guardados:', payload);
    // Aquí iría la llamada al backend
  }

  trackById(_: number, item: EquipmentRecord): number {
    return item.id;
  }
}
