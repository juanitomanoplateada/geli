import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FieldConfig } from '../../../../shared/model/field-config.model';
import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableComponent } from '../../../../shared/components/results-table/results-table.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

import { UserService } from '../../../../core/user/services/user.service';

// Data models
interface UserRecord {
  id: number;
  fullName: string;
  identification: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'status' | 'actions';
}

interface ActionButton {
  label: string | ((row: any) => string);
  action: (row: any) => void;
  color?: string | ((row: any) => string);
}

// Updated filters: four date fields
interface Filters {
  role: '' | 'Personal Autorizado' | 'Analista de Calidad';
  status: '' | 'Activo' | 'Inactivo';
  creationDateFrom: string;
  creationDateTo: string;
  modificationDateFrom: string;
  modificationDateTo: string;
}

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchAdvancedComponent,
    ResultsTableComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.scss'],
})
export class SearchUserComponent implements OnInit {
  actionButtons: ActionButton[] = [
    {
      label: (user) => (user.status === 'Activo' ? 'Desactivar' : 'Activar'),
      action: (user) => this.openConfirmModal(user),
      color: (user) => (user.status === 'Activo' ? 'danger' : 'info'),
    },
  ];

  hasSearched = false;

  // Query and filters
  query = '';
  filters: Filters = {
    role: '',
    status: '',
    creationDateFrom: '',
    creationDateTo: '',
    modificationDateFrom: '',
    modificationDateTo: '',
  };
  showFilters = false;

  // Advanced search configuration with four date inputs
  fieldsConfig: FieldConfig[] = [
    {
      key: 'role',
      label: 'Rol',
      type: 'select',
      options: ['Personal Autorizado', 'Analista de Calidad'],
      allowEmptyOption: 'Todos',
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: ['Activo', 'Inactivo'],
      allowEmptyOption: 'Todos',
    },
    {
      key: 'creationDateFrom',
      label: 'Fecha de creación desde',
      type: 'date',
      placeholder: 'dd/mm/yyyy',
    },
    {
      key: 'creationDateTo',
      label: 'Fecha de creación hasta',
      type: 'date',
      placeholder: 'dd/mm/yyyy',
    },
    {
      key: 'modificationDateFrom',
      label: 'Fecha de modificación desde',
      type: 'date',
      placeholder: 'dd/mm/yyyy',
    },
    {
      key: 'modificationDateTo',
      label: 'Fecha de modificación hasta',
      type: 'date',
      placeholder: 'dd/mm/yyyy',
    },
  ];

  // Available and active filter keys
  availableFilterKeys = [
    { key: 'role', label: 'Rol' },
    { key: 'status', label: 'Estado' },
    { key: 'creationDateFrom', label: 'Fecha de creación desde' },
    { key: 'creationDateTo', label: 'Fecha de creación hasta' },
    { key: 'modificationDateFrom', label: 'Fecha de modificación desde' },
    { key: 'modificationDateTo', label: 'Fecha de modificación hasta' },
  ];
  activeFilterKeys: string[] = [
    'role',
    'status',
    'creationDateFrom',
    'creationDateTo',
    'modificationDateFrom',
    'modificationDateTo',
  ];

  // Table configuration
  columns: ColumnConfig[] = [
    { key: 'fullName', label: 'Nombre completo', type: 'text' },
    { key: 'identification', label: 'Identificación', type: 'text' },
    { key: 'email', label: 'Correo institucional', type: 'text' },
    { key: 'role', label: 'Rol', type: 'text' },
    { key: 'status', label: 'Estado', type: 'status' },
    { key: 'createdAt', label: 'Fecha de creación', type: 'text' },
    { key: 'updatedAt', label: 'Fecha de modificación', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  // Data/state
  users: UserRecord[] = [];
  selectedUser: UserRecord | null = null;
  showConfirmModal = false;
  confirmLoading = false;
  loading = false;

  lastQuery = '';
  lastFilters: Filters = {
    role: '',
    status: '',
    creationDateFrom: '',
    creationDateTo: '',
    modificationDateFrom: '',
    modificationDateTo: '',
  };

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.performSearch();
  }

  onFiltersChange(updated: Partial<Filters>) {
    this.filters = { ...this.filters, ...updated };
    this.performSearch();
  }

  // --- Backend-driven search with four date filters ---
  performSearch(): void {
    this.hasSearched = true;
    this.lastQuery = this.query.trim();
    this.lastFilters = { ...this.filters };
    this.loading = true;
    const q = this.query.trim() || undefined;
    const payload: any = {
      firstName: q,
      lastName: q,
      identification: q,
      email: q,
      enabledStatus:
        this.filters.status === 'Activo'
          ? true
          : this.filters.status === 'Inactivo'
          ? false
          : undefined,
      role:
        this.filters.role === 'Personal Autorizado'
          ? 'AUTHORIZED-USER'
          : this.filters.role === 'Analista de Calidad'
          ? 'QUALITY-ADMIN-USER'
          : undefined,
      creationDateFrom: this.filters.creationDateFrom || undefined,
      creationDateTo: this.filters.creationDateTo || undefined,
      modificationStatusDateFrom:
        this.filters.modificationDateFrom || undefined,
      modificationStatusDateTo: this.filters.modificationDateTo || undefined,
    };
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    this.userService.filterUsers(payload).subscribe({
      next: (res) => {
        this.users = (res || []).map((u: any) => ({
          id: u.id,
          fullName: `${u.firstName} ${u.lastName}`,
          identification: u.identification,
          email: u.email,
          role: this.mapRole(u.role),
          status: u.enabledStatus ? 'Activo' : 'Inactivo',
          createdAt: u.creationDate,
          updatedAt: u.modificationStatusDate,
        }));
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.loading = false;
      },
    });
  }

  resetSearch(): void {
    this.hasSearched = false;
    this.query = '';
    this.filters = {
      status: '',
      role: '',
      creationDateFrom: '',
      creationDateTo: '',
      modificationDateFrom: '',
      modificationDateTo: '',
    };
    this.activeFilterKeys = [
      'status',
      'role',
      'creationDateFrom',
      'creationDateTo',
      'modificationDateFrom',
      'modificationDateTo',
    ];
    this.performSearch();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) this.resetSearch();
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.performSearch();
  }

  // --- No-results message including all date filters ---
  buildNoResultsMessage(): string {
    const parts: string[] = [];

    if (this.lastQuery) {
      parts.push(`texto que contenga "${this.lastQuery.toUpperCase()}"`);
    }
    if (this.lastFilters.status) {
      parts.push(`estado "${this.lastFilters.status}"`);
    }
    if (this.lastFilters.role) {
      parts.push(`rol "${this.lastFilters.role}"`);
    }
    if (this.lastFilters.creationDateFrom) {
      parts.push(
        `fecha de creación desde "${this.lastFilters.creationDateFrom}"`
      );
    }
    if (this.lastFilters.creationDateTo) {
      parts.push(
        `fecha de creación hasta "${this.lastFilters.creationDateTo}"`
      );
    }
    if (this.lastFilters.modificationDateFrom) {
      parts.push(
        `fecha de modificación desde "${this.lastFilters.modificationDateFrom}"`
      );
    }
    if (this.lastFilters.modificationDateTo) {
      parts.push(
        `fecha de modificación hasta "${this.lastFilters.modificationDateTo}"`
      );
    }

    return parts.length
      ? `No se encontraron usuarios con ${parts.join(', ')}.`
      : 'No se encontraron usuarios.';
  }

  trackByIdentification(_: number, u: UserRecord) {
    return u.identification;
  }

  openConfirmModal(user: UserRecord): void {
    this.selectedUser = user;
    this.showConfirmModal = true;
  }
  confirmToggleStatus(): void {
    if (!this.selectedUser) return;
    const newStatus = this.selectedUser.status !== 'Activo';
    this.confirmLoading = true;
    this.userService
      .toggleUserStatus(this.selectedUser.id, newStatus)
      .subscribe({
        next: () => {
          this.performSearch();
          this.closeConfirmModal();
        },
        error: () => {
          this.confirmLoading = false;
          this.closeConfirmModal();
        },
      });
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmLoading = false;
    this.selectedUser = null;
  }

  private mapRole(r: string) {
    return r === 'AUTHORIZED-USER'
      ? 'Personal Autorizado'
      : r === 'QUALITY-ADMIN-USER'
      ? 'Analista de Calidad'
      : r;
  }
}
