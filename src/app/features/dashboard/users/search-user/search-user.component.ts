import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FieldConfig } from '../../../../shared/model/field-config.model';
import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableComponent } from '../../../../shared/components/results-table/results-table.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

import { UserService } from '../../../../core/user/services/user.service';
import { PositionService } from '../../../../core/position/services/position.service';

interface UserRecord {
  id: number;
  fullName: string;
  identification: string;
  email: string;
  role: string;
  status: string;
  position?: string;
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

interface Filters {
  role: '' | 'Personal Autorizado' | 'Analista de Calidad';
  status: '' | 'Activo' | 'Inactivo';
  positionId?: number | null;
  modificationDateFrom: string;
  modificationDateTo: string;
}

interface PositionDTO {
  id: number;
  name: string;
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
  query = '';
  filters: Filters = {
    role: '',
    status: '',
    positionId: null,
    modificationDateFrom: '',
    modificationDateTo: '',
  };

  users: UserRecord[] = [];
  positions: PositionDTO[] = [];
  loading = false;
  showFilters = false;
  hasSearched = false;
  selectedUser: UserRecord | null = null;
  showConfirmModal = false;
  confirmLoading = false;

  lastQuery = '';
  lastFilters: Filters = { ...this.filters };

  columns: ColumnConfig[] = [
    { key: 'fullName', label: 'Nombre completo', type: 'text' },
    { key: 'identification', label: 'Identificación', type: 'text' },
    { key: 'email', label: 'Correo institucional', type: 'text' },
    { key: 'role', label: 'Rol', type: 'text' },
    { key: 'status', label: 'Estado', type: 'status' },
    { key: 'position', label: 'Cargo', type: 'text' },
    { key: 'updatedAt', label: 'Fecha de modificación', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  fieldsConfig: FieldConfig[] = [];

  availableFilterKeys = [
    { key: 'role', label: 'Rol' },
    { key: 'status', label: 'Estado' },
    { key: 'positionId', label: 'Cargo' },
    { key: 'modificationDateFrom', label: 'Fecha de modificación desde' },
    { key: 'modificationDateTo', label: 'Fecha de modificación hasta' },
  ];

  activeFilterKeys = this.availableFilterKeys.map((f) => f.key);

  options: { [key: string]: any[] } = {};

  constructor(
    private router: Router,
    private userService: UserService,
    private positionService: PositionService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.positionService.getAll().subscribe({
      next: (res) => {
        this.positions = res;

        this.options['positionId'] = res.map((p) => ({
          label: p.name,
          value: p.id,
        }));

        this.fieldsConfig = [
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
            key: 'positionId',
            label: 'Cargo',
            type: 'dropdown',
            allowEmptyOption: 'Todos',
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

        this.loading = false;
        this.performSearch();
      },
      error: () => {
        this.loading = false;
        this.positions = [];
        this.performSearch();
      },
    });
  }

  get isFilterReady(): boolean {
    return (
      this.fieldsConfig.length > 0 && !!this.options?.['positionId']?.length
    );
  }

  onFiltersChange(updated: Partial<Filters>) {
    this.filters = { ...this.filters, ...updated };
    this.performSearch();
  }

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
      positionId:
        typeof this.filters.positionId === 'number'
          ? this.filters.positionId
          : undefined,

      modificationStatusDateFrom:
        this.filters.modificationDateFrom || undefined,
      modificationStatusDateTo: this.filters.modificationDateTo || undefined,
    };

    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    this.userService.filterUsers(payload).subscribe({
      next: (res) => {
        this.users = res.map((u: any) => ({
          id: u.id,
          fullName: `${u.firstName} ${u.lastName}`,
          identification: u.identification,
          email: u.email,
          role: this.mapRole(u.role),
          status: u.enabledStatus ? 'Activo' : 'Inactivo',
          position: u.position?.name || '—',
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
    this.query = '';
    this.filters = {
      role: '',
      status: '',
      positionId: null,
      modificationDateFrom: '',
      modificationDateTo: '',
    };
    this.activeFilterKeys = this.availableFilterKeys.map((f) => f.key);
    this.performSearch();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) this.resetSearch();
  }

  buildNoResultsMessage(): string {
    const parts: string[] = [];

    if (this.lastQuery)
      parts.push(`texto que contenga "${this.lastQuery.toUpperCase()}"`);
    if (this.lastFilters.status)
      parts.push(`estado "${this.lastFilters.status}"`);
    if (this.lastFilters.role) parts.push(`rol "${this.lastFilters.role}"`);
    if (this.lastFilters.positionId) {
      const cargo = this.positions.find(
        (p) => p.id === this.lastFilters.positionId
      )?.name;
      if (cargo) parts.push(`cargo "${cargo}"`);
    }
    if (this.lastFilters.modificationDateFrom)
      parts.push(`fecha desde "${this.lastFilters.modificationDateFrom}"`);
    if (this.lastFilters.modificationDateTo)
      parts.push(`fecha hasta "${this.lastFilters.modificationDateTo}"`);

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

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmLoading = false;
    this.selectedUser = null;
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

  private mapRole(r: string) {
    return r === 'AUTHORIZED-USER'
      ? 'Personal Autorizado'
      : r === 'QUALITY-ADMIN-USER'
      ? 'Analista de Calidad'
      : r;
  }

  actionButtons: ActionButton[] = [
    {
      label: 'Editar',
      action: (user) =>
        this.router.navigate([`/dashboard/users/update-user/${user.id}`]),
      color: 'primary',
    },
  ];
}
