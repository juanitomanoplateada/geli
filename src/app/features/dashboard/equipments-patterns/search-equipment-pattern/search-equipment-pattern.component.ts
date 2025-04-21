import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownFilterComponent } from '../../../../shared/components/dropdown-filter/dropdown-filter.component';

@Component({
  selector: 'app-search-equipment-pattern',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownFilterComponent],
  templateUrl: './search-equipment-pattern.component.html',
  styleUrls: ['./search-equipment-pattern.component.scss'],
})
export class SearchEquipmentPatternComponent implements OnInit {
  constructor(private router: Router) {}

  // Entrada de búsqueda general
  searchQuery = '';
  showAdvancedSearch = false;
  isLoading = false;

  // Opciones de filtros
  availabilityOptions = ['Disponible', 'No disponible'];
  functionOptions = ['Medición', 'Calibración', 'Análisis'];
  laboratoryOptions = ['Lab Física', 'Lab Química', 'Lab Electrónica'];

  // Filtros aplicados
  filters = {
    availability: '',
    function: '',
    laboratory: '',
  };

  // Resultados
  equipmentResults: any[] = [];

  ngOnInit(): void {
    // Aquí podrías cargar los datos dinámicamente en lugar de usar datos simulados
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.performSearch();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filters = {
      availability: '',
      function: '',
      laboratory: '',
    };
    this.equipmentResults = [];
  }

  performSearch(): void {
    this.isLoading = true;

    // Datos simulados
    const allEquipment = [
      {
        id: 1,
        name: 'Multímetro',
        brand: 'Fluke',
        inventoryCode: 'EQ-001',
        availability: 'Disponible',
        function: { name: 'Medición' },
        laboratory: { name: 'Lab Electrónica' },
      },
      {
        id: 2,
        name: 'Analizador',
        brand: 'Keysight',
        inventoryCode: 'EQ-002',
        availability: 'No disponible',
        function: { name: 'Análisis' },
        laboratory: { name: 'Lab Química' },
      },
    ];

    setTimeout(() => {
      const query = this.searchQuery.toLowerCase();
      const { availability, function: func, laboratory } = this.filters;

      this.equipmentResults = allEquipment.filter((eq) => {
        const matchQuery =
          !query ||
          eq.name.toLowerCase().includes(query) ||
          eq.brand.toLowerCase().includes(query) ||
          eq.inventoryCode.toLowerCase().includes(query);

        const matchAvailability =
          !availability || eq.availability === availability;
        const matchFunction = !func || eq.function.name === func;
        const matchLab = !laboratory || eq.laboratory.name === laboratory;

        return matchQuery && matchAvailability && matchFunction && matchLab;
      });

      this.isLoading = false;
    }, 400);
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/dashboard/update-equipment', id]);
  }
}
