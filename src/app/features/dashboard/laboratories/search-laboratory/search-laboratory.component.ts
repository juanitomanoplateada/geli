import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LaboratoryService } from '../../../../core/laboratory/services/laboratory.service';
import { Laboratory } from '../../../../core/laboratory/models/laboratory.model';
import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableComponent } from '../../../../shared/components/results-table/results-table.component'; // nuevo componente reutilizable
import { FieldConfig } from '../../../../shared/model/field-config.model';

interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'status' | 'actions';
}

interface ActionButton {
  label: string;
  action: (row: any) => void;
  color?: 'primary' | 'danger' | 'info';
}

@Component({
  selector: 'app-search-laboratory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchAdvancedComponent,
    ResultsTableComponent,
  ],
  templateUrl: './search-laboratory.component.html',
  styleUrls: ['./search-laboratory.component.scss'],
})
export class SearchLaboratoryComponent implements OnInit {
  constructor(
    private router: Router,
    private laboratoryService: LaboratoryService
  ) {}

  searchQuery: string = '';
  showAdvancedSearch: boolean = false;
  isLoading: boolean = false;
  laboratories: Laboratory[] = [];
  allLabs: Laboratory[] = [];

  filters: { [key: string]: any } = {
    availability: '',
    location: '',
  };

  fieldsConfig: FieldConfig[] = [
    {
      key: 'availability',
      label: 'Disponibilidad',
      type: 'select',
      options: ['Disponible', 'No disponible'],
      allowEmptyOption: 'Todas',
    },
    {
      key: 'location',
      label: 'Ubicación',
      type: 'select',
      options: [],
      allowEmptyOption: 'Todas',
    },
  ];

  availableFilterKeys = [
    { key: 'availability', label: 'Disponibilidad' },
    { key: 'location', label: 'Ubicación' },
  ];

  activeFilterKeys: string[] = ['availability', 'location'];

  // 🚀 Configuración de la tabla reutilizable
  columns: ColumnConfig[] = [
    { key: 'laboratoryName', label: 'Nombre', type: 'text' },
    { key: 'locationName', label: 'Ubicación', type: 'text' },
    { key: 'laboratoryDescription', label: 'Descripción', type: 'text' },
    { key: 'laboratoryAvailability', label: 'Disponibilidad', type: 'status' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  actionButtons: ActionButton[] = [
    {
      label: 'Editar',
      action: (lab) => this.navigateToEdit(lab.id),
      color: 'primary',
    },
  ];

  ngOnInit(): void {
    this.fetchLaboratories();
  }

  fetchLaboratories(): void {
    this.isLoading = true;
    this.laboratoryService.getLaboratories().subscribe({
      next: (labs) => {
        this.allLabs = labs;
        this.laboratories = labs.map((lab) => ({
          ...lab,
          locationName: lab.location?.locationName || '-', // ⚡ Mapeo para usarlo directamente en la tabla
        }));
        this.updateLocationOptions();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al obtener laboratorios:', err);
        this.isLoading = false;
      },
    });
  }

  updateLocationOptions(): void {
    const locations = [
      ...new Set(this.allLabs.map((lab) => lab.location?.locationName || '-')),
    ];
    const locationField = this.fieldsConfig.find(
      (field) => field.key === 'location'
    );
    if (locationField) {
      locationField.options = locations;
    }
  }

  performSearch(): void {
    const { availability, location } = this.filters;
    const query = this.searchQuery.trim().toLowerCase(); // 🔥 Aseguramos minúsculas para comparar

    const backendFilters: any = {
      laboratoryAvailability:
        availability === 'Disponible'
          ? true
          : availability === 'No disponible'
          ? false
          : undefined,
      locationId: location ? this.getLocationIdByName(location) : undefined,
    };

    Object.keys(backendFilters).forEach(
      (key) => backendFilters[key] === undefined && delete backendFilters[key]
    );

    this.isLoading = true;
    this.laboratoryService.filterLaboratories(backendFilters).subscribe({
      next: (labs) => {
        if (!labs || labs.length === 0) {
          this.laboratories = [];
        } else {
          const mappedLabs = labs.map((lab) => ({
            ...lab,
            locationName: lab.location?.locationName || '-',
          }));

          // 🔥🔥 Aquí aplicas el filtro por nombre o descripción
          this.laboratories = mappedLabs.filter((lab) => {
            const name = lab.laboratoryName?.toLowerCase() || '';
            const description = lab.laboratoryDescription?.toLowerCase() || '';
            return name.includes(query) || description.includes(query);
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al filtrar laboratorios:', err);
        this.laboratories = [];
        this.isLoading = false;
      },
    });
  }

  getLocationIdByName(locationName: string): number | undefined {
    const lab = this.allLabs.find(
      (l) => l.location?.locationName === locationName
    );
    return lab?.location?.id;
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.performSearch();
    }
  }

  toggleFilters(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
    if (!this.showAdvancedSearch) {
      this.resetSearch();
    }
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.filters = {
      availability: '',
      location: '',
    };
    this.performSearch();
  }

  trackById(index: number, item: Laboratory): number {
    return item.id;
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/dashboard/update-laboratory', id]);
  }

  buildNoResultsMessage(): string {
    const parts: string[] = [];

    if (this.searchQuery.trim()) {
      parts.push(`nombre que contenga "${this.searchQuery.trim()}"`);
    }

    if (this.filters['availability']) {
      parts.push(`disponibilidad "${this.filters['availability']}"`);
    }

    if (this.filters['location']) {
      parts.push(`ubicación "${this.filters['location']}"`);
    }

    if (parts.length === 0) {
      return 'No se encontraron laboratorios.';
    }

    return 'No se encontraron laboratorios con ' + parts.join(', ') + '.';
  }
}
