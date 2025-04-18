import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-equipment-pattern',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-equipment-pattern.component.html',
  styleUrls: ['./search-equipment-pattern.component.scss'],
})
export class SearchEquipmentPatternComponent implements OnInit {
  constructor(private router: Router) {}

  searchQuery = '';
  showAdvancedSearch = false;
  isLoading = false;

  availabilityOptions = ['Disponible', 'No disponible'];
  functionOptions = ['Medición', 'Calibración', 'Análisis'];
  laboratoryOptions = ['Lab Física', 'Lab Química', 'Lab Electrónica'];

  filters = {
    availability: '',
    function: '',
    laboratory: '',
  };

  filteredFunctions: string[] = [];
  filteredLabs: string[] = [];
  functionSearchTerm = '';
  labSearchTerm = '';

  functionDropdownOpen = false;
  labDropdownOpen = false;
  selectedFunctionLabel = 'Todas';
  selectedLabLabel = 'Todos';

  equipmentResults: any[] = [];

  ngOnInit(): void {
    this.filteredFunctions = [...this.functionOptions];
    this.filteredLabs = [...this.laboratoryOptions];
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.performSearch();
  }

  performSearch(): void {
    this.isLoading = true;

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

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filters = { availability: '', function: '', laboratory: '' };
    this.functionSearchTerm = '';
    this.labSearchTerm = '';
    this.selectedFunctionLabel = 'Todas';
    this.selectedLabLabel = 'Todos';
    this.filteredFunctions = [...this.functionOptions];
    this.filteredLabs = [...this.laboratoryOptions];
    this.equipmentResults = [];
  }

  toggleFunctionDropdown(): void {
    this.functionDropdownOpen = !this.functionDropdownOpen;
    this.filteredFunctions = [...this.functionOptions];
    this.functionSearchTerm = '';
  }

  filterFunctions(): void {
    const term = this.functionSearchTerm.toLowerCase();
    this.filteredFunctions = this.functionOptions.filter((f) =>
      f.toLowerCase().includes(term)
    );
  }

  selectFunction(func: string): void {
    this.filters.function = func;
    this.selectedFunctionLabel = func || 'Todas';
    this.functionDropdownOpen = false;
    this.performSearch();
  }

  toggleLabDropdown(): void {
    this.labDropdownOpen = !this.labDropdownOpen;
    this.filteredLabs = [...this.laboratoryOptions];
    this.labSearchTerm = '';
  }

  filterLabs(): void {
    const term = this.labSearchTerm.toLowerCase();
    this.filteredLabs = this.laboratoryOptions.filter((l) =>
      l.toLowerCase().includes(term)
    );
  }

  selectLab(lab: string): void {
    this.filters.laboratory = lab;
    this.selectedLabLabel = lab || 'Todos';
    this.labDropdownOpen = false;
    this.performSearch();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/dashboard/update-equipment', id]);
  }
}
