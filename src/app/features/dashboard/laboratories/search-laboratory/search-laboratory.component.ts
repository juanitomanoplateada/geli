import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { LaboratoryService } from '../../../../core/laboratory/services/laboratory.service';

@Component({
  selector: 'app-search-laboratory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-laboratory.component.html',
  styleUrls: ['./search-laboratory.component.scss'],
})
export class SearchLaboratoryComponent implements OnInit {
  constructor(
    private router: Router,
    public authService: AuthService,
    public laboratoryService: LaboratoryService
  ) {}

  // Estado visual y datos
  searchQuery: string = '';
  showAdvancedSearch: boolean = false;
  isLoading: boolean = false;

  availableLocations: string[] = [];
  filteredLocations: string[] = [];
  locationSearchTerm: string = '';
  dropdownOpen: boolean = false;
  selectedLocationLabel: string = 'Todas';

  filters = {
    availability: '',
    location: '',
  };

  laboratories: any[] = [];
  allLabs: any[] = [];

  ngOnInit(): void {
    this.filteredLocations = [];
    // Puedes comentar esta línea si no deseas login automático:
    this.loginAndFetchLabs('marcela.admin', '123');
  }

  loginAndFetchLabs(username: string, password: string): void {
    this.isLoading = true;

    this.authService.login(username, password).subscribe({
      next: (res) => {
        const token = res.access_token;

        this.laboratoryService.getLaboratories(token).subscribe({
          next: (labs) => {
            this.allLabs = labs;
            this.laboratories = labs;

            this.availableLocations = [
              ...new Set(labs.map((lab) => lab.location.locationName)),
            ];
            this.filteredLocations = [...this.availableLocations];
            this.isLoading = false;
          },
          error: (err) => {
            console.error('❌ Error al obtener laboratorios:', err);
            this.isLoading = false;
          },
        });
      },
      error: (err) => {
        console.error('❌ Error al hacer login:', err);
        this.isLoading = false;
      },
    });
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.performSearch();
  }

  performSearch(): void {
    const query = this.searchQuery.toLowerCase();
    const { availability, location } = this.filters;

    this.laboratories = this.allLabs.filter((lab) => {
      const matchesQuery =
        !query ||
        lab.laboratoryName.toLowerCase().includes(query) ||
        lab.laboratoryDescription.toLowerCase().includes(query);

      const matchesAvailability =
        !availability ||
        (availability === 'Disponible' && lab.laboratoryAvailability) ||
        (availability === 'No disponible' && !lab.laboratoryAvailability);

      const matchesLocation =
        !location ||
        lab.location.locationName
          .toLowerCase()
          .includes(location.toLowerCase());

      return matchesQuery && matchesAvailability && matchesLocation;
    });
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
    this.laboratories = [...this.allLabs];
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/dashboard/update-laboratory', id]);
  }
}
