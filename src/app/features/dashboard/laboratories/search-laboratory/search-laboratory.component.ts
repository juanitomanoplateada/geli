import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { LaboratoryService } from '../../../../core/laboratory/services/laboratory.service';
import { DropdownFilterComponent } from '../../../../shared/components/dropdown-filter/dropdown-filter.component';

@Component({
  selector: 'app-search-laboratory',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownFilterComponent],
  templateUrl: './search-laboratory.component.html',
  styleUrls: ['./search-laboratory.component.scss'],
})
export class SearchLaboratoryComponent implements OnInit {
  constructor(
    private router: Router,
    public authService: AuthService,
    public laboratoryService: LaboratoryService
  ) {}

  // Estado de búsqueda
  searchQuery: string = '';
  showAdvancedSearch: boolean = false;
  isLoading: boolean = false;

  // Filtros y datos
  filters = {
    availability: '',
    location: '',
  };

  availableLocations: string[] = [];
  selectedLocationLabel: string = 'Todas';

  laboratories: any[] = [];
  allLabs: any[] = [];

  ngOnInit(): void {
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

  onLocationChange(newLocation: string): void {
    this.filters.location = newLocation;
    this.selectedLocationLabel = newLocation || 'Todas';
    this.performSearch();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filters = { availability: '', location: '' };
    this.selectedLocationLabel = 'Todas';
    this.laboratories = [...this.allLabs];
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/dashboard/update-laboratory', id]);
  }
}
