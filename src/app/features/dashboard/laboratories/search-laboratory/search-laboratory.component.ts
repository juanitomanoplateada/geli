import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableComponent } from '../../../../shared/components/results-table/results-table.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

import { FieldConfig } from '../../../../shared/model/field-config.model';
import { LaboratoryService } from '../../../../core/services/laboratory/laboratory.service';
import { LocationService } from '../../../../core/services/location/location.service';
import { LocationDto } from '../../../../core/dto/location/location-response.dto';

interface LaboratoryRecord {
  id: number;
  labName: string;
  description: string;
  locationName: string;
  status: string;
  notes: string;
}

interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'status' | 'actions';
}

interface FilterKey {
  key: string;
  label: string;
}

interface Filters {
  status: '' | 'Activo' | 'Inactivo';
  locationId?: number;
}

@Component({
  selector: 'app-search-laboratory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchAdvancedComponent,
    ResultsTableComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './search-laboratory.component.html',
  styleUrls: ['./search-laboratory.component.scss'],
})
export class SearchLaboratoryComponent implements OnInit {
  query = '';
  filters: Filters = {
    status: '',
    locationId: undefined,
  };

  laboratories: LaboratoryRecord[] = [];
  loading = false;
  showFilters = false;
  hasSearched = false;
  selectedLab: LaboratoryRecord | null = null;
  showConfirmModal = false;
  confirmLoading = false;

  lastQuery = '';
  lastFilters: Filters = { ...this.filters };

  columns: ColumnConfig[] = [
    { key: 'labName', label: 'Nombre', type: 'text' },
    { key: 'locationName', label: 'Lugar', type: 'text' },
    { key: 'status', label: 'Estado', type: 'status' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  fieldsConfig: FieldConfig[] = [
    {
      key: 'locationId', // ahora usamos el ID
      label: 'Lugar',
      type: 'dropdown',
      allowEmptyOption: 'Todos',
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: ['Activo', 'Inactivo'],
      allowEmptyOption: 'Todos',
    },
  ];

  options: { [key: string]: any[] } = {
    locationId: [],
  };

  availableFilterKeys: FilterKey[] = [
    { key: 'locationId', label: 'Lugar' },
    { key: 'status', label: 'Estado' },
  ];
  activeFilterKeys: string[] = this.availableFilterKeys.map((f) => f.key);

  // Variables de paginación
  currentPage = 0;
  totalPages = 0;
  pageSize = 5;
  pageSizeOptions = [5, 15, 30, 50, 100];

  constructor(
    private router: Router,
    private labService: LaboratoryService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.loadLocationOptions();
    this.performSearch();
  }

  private loadLocationOptions(): void {
    this.locationService.getAll().subscribe({
      next: (locations: LocationDto[] | null) => {
        this.options['locationId'] = (locations ?? []).map((l) => ({
          label: l.locationName,
          value: l.id,
        }));
      },
      error: () => {
        this.options['locationId'] = [];
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

  get isFilterReady(): boolean {
    return this.fieldsConfig.length > 0;
  }

  onFiltersChange(updated: Partial<Filters>) {
    this.filters = { ...this.filters, ...updated };
    this.performSearch();
  }

  performSearch(): void {
    this.loading = true;

    const payload: any = {
      laboratoryName: this.query.trim() || undefined,
      locationId: this.filters.locationId || undefined,
      laboratoryAvailability:
        this.filters.status === 'Activo'
          ? true
          : this.filters.status === 'Inactivo'
          ? false
          : undefined,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === '') {
        delete payload[k];
      }
    });

    this.labService
      .filterLaboratories(payload, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.lastQuery = this.query.trim();
          this.lastFilters = { ...this.filters };
          this.hasSearched = true;

          if (!res || !res.content) {
            // Si no hay resultados o el backend responde con 204 sin cuerpo
            this.totalPages = 0;
            this.laboratories = [];
          } else {
            this.totalPages = res.totalPages;
            this.currentPage = res.page;

            this.laboratories = res.content.map((l: any) => ({
              id: l.id,
              labName: l.laboratoryName,
              description: l.laboratoryDescription,
              locationName: l.location?.locationName || '—',
              status: l.laboratoryAvailability ? 'Activo' : 'Inactivo',
              notes: l.laboratoryObservations || '—',
            }));
          }

          this.loading = false;
        },
        error: (err) => {
          if (err.status === 204) {
            // Manejo explícito para No Content
            this.totalPages = 0;
            this.laboratories = [];
          } else {
            console.error('Error al buscar laboratorios:', err);
          }

          this.hasSearched = true;
          this.loading = false;
        },
      });
  }

  resetSearch(): void {
    this.query = '';
    this.filters = {
      status: '',
      locationId: undefined,
    };
    this.activeFilterKeys = [...this.availableFilterKeys.map((f) => f.key)];
    this.performSearch();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) this.resetSearch();
  }

  buildNoResultsMessage(): string {
    const parts: string[] = [];

    if (this.lastQuery)
      parts.push(`nombre conteniendo "${this.lastQuery.toUpperCase()}"`);
    if (this.lastFilters.locationId) {
      const locationOption = this.options['locationId']?.find(
        (opt) => opt.value === this.lastFilters.locationId
      );
      const locationLabel = locationOption
        ? locationOption.label
        : `ID ${this.lastFilters.locationId}`;
      parts.push(`ubicación "${locationLabel}"`);
    }
    if (this.lastFilters.status)
      parts.push(`estado "${this.lastFilters.status}"`);

    return parts.length
      ? `No se encontraron laboratorios con ${parts.join(', ')}.`
      : 'No se encontraron laboratorios.';
  }

  trackById(_: number, l: LaboratoryRecord) {
    return l.id;
  }

  openConfirmModal(lab: LaboratoryRecord): void {
    this.selectedLab = lab;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.selectedLab = null;
    this.showConfirmModal = false;
    this.confirmLoading = false;
  }

  confirmToggleStatus(): void {
    // Implementar si tienes endpoint de estado
  }

  actionButtons = [
    {
      label: 'Editar',
      action: (lab: LaboratoryRecord) =>
        this.router.navigate([
          `/dashboard/laboratories/update-laboratory/${lab.id}`,
        ]),
      color: 'primary',
    },
  ];
}
