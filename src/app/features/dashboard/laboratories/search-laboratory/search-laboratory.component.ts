import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableComponent } from '../../../../shared/components/results-table/results-table.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { FieldConfig } from '../../../../shared/model/field-config.model';
import { LaboratoryService } from '../../../../core/laboratory/services/laboratory.service';

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
  locationName?: string;
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
    locationName: '',
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
    { key: 'description', label: 'Descripción', type: 'text' },
    { key: 'locationName', label: 'Lugar', type: 'text' },
    { key: 'status', label: 'Estado', type: 'status' },
    { key: 'notes', label: 'Observaciones', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  fieldsConfig: FieldConfig[] = [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: ['Activo', 'Inactivo'],
      allowEmptyOption: 'Todos',
    },
    {
      key: 'locationName',
      label: 'Lugar',
      type: 'dropdown',
      allowEmptyOption: 'Todos',
    },
  ];

  options: { [key: string]: any[] } = {
    locationName: [
      { label: 'Bloque A', value: 'Bloque A' },
      { label: 'Bloque B', value: 'Bloque B' },
      { label: 'Edificio Central', value: 'Edificio Central' },
      { label: 'Sala de Cómputo', value: 'Sala de Cómputo' },
    ],
  };

  availableFilterKeys: FilterKey[] = [
    { key: 'status', label: 'Estado' },
    { key: 'locationName', label: 'Lugar' },
  ];
  activeFilterKeys: string[] = this.availableFilterKeys.map((f) => f.key);

  constructor(private router: Router, private labService: LaboratoryService) {}

  ngOnInit(): void {
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
    /*this.hasSearched = true;
    this.lastQuery = this.query.trim();
    this.lastFilters = { ...this.filters };
    this.loading = true;

    const payload: any = {
      labName: this.query.trim() || undefined,
      description: this.query.trim() || undefined,
      locationName: this.filters.locationName || undefined,
      status:
        this.filters.status === 'Activo'
          ? true
          : this.filters.status === 'Inactivo'
          ? false
          : undefined,
    };

    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    this.labService.filterLaboratories(payload).subscribe({
      next: (res) => {
        this.laboratories = res.map((l: any) => ({
          id: l.id,
          labName: l.labName,
          description: l.description,
          locationName: l.locationName,
          status: l.status ? 'Activo' : 'Inactivo',
          notes: l.notes || '—',
        }));
        this.loading = false;
      },
      error: () => {
        this.laboratories = [];
        this.loading = false;
      },
    });*/
  }

  resetSearch(): void {
    this.query = '';
    this.filters = {
      status: '',
      locationName: '',
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
      parts.push(
        `nombre o descripción conteniendo "${this.lastQuery.toUpperCase()}"`
      );
    if (this.lastFilters.locationName)
      parts.push(`ubicación "${this.lastFilters.locationName}"`);
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
    /*if (!this.selectedLab) return;
    const newStatus = this.selectedLab.status !== 'Activo';
    this.confirmLoading = true;
    this.labService
      .toggleLaboratoryStatus(this.selectedLab.id, newStatus)
      .subscribe({
        next: () => {
          this.performSearch();
          this.closeConfirmModal();
        },
        error: () => {
          this.confirmLoading = false;
          this.closeConfirmModal();
        },
      });*/
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
