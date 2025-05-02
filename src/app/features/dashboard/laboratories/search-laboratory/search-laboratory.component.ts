import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableComponent } from '../../../../shared/components/results-table/results-table.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

import { FieldConfig } from '../../../../shared/model/field-config.model';
import { LaboratoryService } from '../../../../core/laboratory/services/laboratory.service';
import {
  LocationService,
  LocationDto,
} from '../../../../core/location/services/location.service';

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

    this.labService.filterLaboratories(payload).subscribe({
      next: (res) => {
        this.lastQuery = this.query.trim();
        this.lastFilters = { ...this.filters };
        this.hasSearched = true;

        this.laboratories = (res || []).map((l: any) => ({
          id: l.id,
          labName: l.laboratoryName,
          description: l.laboratoryDescription,
          locationName: l.location?.locationName || '—',
          status: l.laboratoryAvailability ? 'Activo' : 'Inactivo',
          notes: l.laboratoryObservations || '—',
        }));

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al buscar laboratorios:', err);
        this.laboratories = [];
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
