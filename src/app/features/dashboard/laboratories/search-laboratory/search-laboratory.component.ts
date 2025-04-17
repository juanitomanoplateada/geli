import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-laboratory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-laboratory.component.html',
  styleUrls: ['./search-laboratory.component.scss'],
})
export class SearchLaboratoryComponent implements OnInit {
  constructor(private router: Router) {}

  searchQuery: string = '';
  showAdvancedSearch: boolean = false;
  isLoading: boolean = false;

  // Ubicación con dropdown independiente
  availableLocations: string[] = ['Edificio A - Piso 2', 'Edificio B - Piso 1'];
  filteredLocations: string[] = [];
  locationSearchTerm: string = '';
  dropdownOpen: boolean = false;
  selectedLocationLabel: string = 'Todas';

  filters = {
    availability: '',
    location: '',
  };

  laboratories: any[] = [];

  ngOnInit(): void {
    this.filteredLocations = [...this.availableLocations];
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.performSearch();
  }

  performSearch(): void {
    this.isLoading = true;

    const allLabs = [
      {
        id: 1,
        name: 'Lab Redes',
        description: 'Laboratorio de Redes y Comunicaciones',
        availability: 'Disponible',
        location: { name: 'Edificio A - Piso 2' },
      },
      {
        id: 2,
        name: 'Lab Electrónica',
        description: 'Laboratorio de circuitos',
        availability: 'No disponible',
        location: { name: 'Edificio B - Piso 1' },
      },
    ];

    setTimeout(() => {
      const query = this.searchQuery.toLowerCase();
      const { availability, location } = this.filters;

      this.laboratories = allLabs.filter((lab) => {
        const matchesQuery =
          !query ||
          lab.name.toLowerCase().includes(query) ||
          lab.description.toLowerCase().includes(query);

        const matchesAvailability =
          !availability || lab.availability === availability;

        const matchesLocation =
          !location ||
          lab.location.name.toLowerCase().includes(location.toLowerCase());

        return matchesQuery && matchesAvailability && matchesLocation;
      });

      this.isLoading = false;
    }, 400);
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
    this.filteredLocations = [...this.availableLocations];
    this.locationSearchTerm = '';
  }

  filterLocations(): void {
    const term = this.locationSearchTerm.toLowerCase();
    this.filteredLocations = this.availableLocations.filter((loc) =>
      loc.toLowerCase().includes(term)
    );
  }

  selectLocation(location: string): void {
    this.filters.location = location;
    this.selectedLocationLabel = location;
    this.dropdownOpen = false;
    this.performSearch();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filters = { availability: '', location: '' };
    this.selectedLocationLabel = 'Todas';
    this.locationSearchTerm = '';
    this.filteredLocations = [...this.availableLocations];
    this.laboratories = [];
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/dashboard/update-laboratory', id]);
  }
}
