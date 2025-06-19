import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FieldConfig } from '../../../../shared/model/field-config.model';
import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component';
import { ResultsTableComponent } from '../../../../shared/components/results-table/results-table.component';

import { UserService } from '../../../../core/user/services/user.service';
import { PositionService } from './../../../../core/services/position/position.service';
import { PositionDto } from './../../../../core/dto/position/position-response.dto';

interface UserRecord {
  id: number;
  fullName: string;
  identification: string;
  email: string;
  role: string;
  status: string;
  position?: string;
  creationDate: string;
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
  role: '' | 'PERSONAL AUTORIZADO' | 'ANALISTA DE CALIDAD';
  status: '' | 'ACTIVO' | 'INACTIVO';
  positionId?: number | null;
  creationDateFrom: string;
  creationDateTo: string;
}

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchAdvancedComponent,
    ResultsTableComponent,
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
    creationDateFrom: '',
    creationDateTo: '',
  };

  users: UserRecord[] = [];
  positions: PositionDto[] = [];
  loading = false;
  showFilters = false;
  hasSearched = false;
  selectedUser: UserRecord | null = null;
  showConfirmModal = false;
  confirmLoading = false;

  lastQuery = '';
  lastFilters: Filters = { ...this.filters };

  columns: ColumnConfig[] = [
    { key: 'identification', label: 'Identificación', type: 'text' },
    { key: 'fullName', label: 'Nombre Completo', type: 'text' },
    { key: 'role', label: 'Rol', type: 'text' },
    { key: 'position', label: 'Cargo', type: 'text' },
    { key: 'status', label: 'Estado', type: 'status' },
    { key: 'creationDate', label: 'Fecha de Creación', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  fieldsConfig: FieldConfig[] = [];

  availableFilterKeys = [
    { key: 'role', label: 'Rol' },
    { key: 'positionId', label: 'Cargo' },
    { key: 'status', label: 'Estado' },
    { key: 'creationDateFrom', label: 'Fecha de creación desde' },
    { key: 'creationDateTo', label: 'Fecha de creación hasta' },
  ];

  activeFilterKeys = this.availableFilterKeys.map((f) => f.key);

  options: { [key: string]: any[] } = {};

  noResults = false;

  // Variables de paginación
  currentPage = 0;
  totalPages = 0;
  pageSize = 5;
  pageSizeOptions = [5, 15, 30, 50, 100];

  constructor(
    private router: Router,
    private userService: UserService,
    private positionService: PositionService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.positionService.getAll().subscribe({
      next: (res) => {
        const positionList = Array.isArray(res) ? res : [];

        this.positions = positionList;

        this.options['positionId'] = positionList.map((p) => ({
          label: p.name,
          value: p.id,
        }));

        this.fieldsConfig = [
          {
            key: 'role',
            label: 'Rol',
            type: 'select',
            options: ['PERSONAL AUTORIZADO', 'ANALISTA DE CALIDAD'],
            allowEmptyOption: 'TODOS',
          },
          {
            key: 'positionId',
            label: 'Cargo',
            type: 'dropdown',
            allowEmptyOption: 'TODOS',
          },
          {
            key: 'status',
            label: 'Estado',
            type: 'select',
            options: ['ACTIVO', 'INACTIVO'],
            allowEmptyOption: 'TODOS',
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
        ];

        this.loading = false;
        this.performSearch();
      },
      error: () => {
        this.positions = [];
        this.options['positionId'] = [];
        this.loading = false;
        this.performSearch();
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
    return (
      this.fieldsConfig.length > 0 && !!this.options?.['positionId']?.length
    );
  }

  onFiltersChange(updated: Partial<Filters>) {
    this.filters = { ...this.filters, ...updated };
    this.performSearch();
  }

  performSearch(): void {
    if (
      (this.filters.creationDateFrom &&
        this.filters.creationDateFrom.length < 10) ||
      (this.filters.creationDateTo && this.filters.creationDateTo.length < 10)
    ) {
      this.loading = false;
      return;
    }

    this.hasSearched = true;
    this.noResults = false;
    this.lastQuery = this.query.trim();
    this.lastFilters = { ...this.filters };
    this.loading = true;

    const q = this.query.trim() || undefined;

    const payload: any = {
      firstName: q,
      lastName: q,
      identification: q,
      email: q,
      enabledStatus: this.getEnabledStatusValue(this.filters.status),
      role:
        this.filters.role === 'PERSONAL AUTORIZADO'
          ? 'AUTHORIZED-USER'
          : this.filters.role === 'ANALISTA DE CALIDAD'
          ? 'QUALITY-ADMIN-USER'
          : undefined,
      positionId:
        typeof this.filters.positionId === 'number'
          ? this.filters.positionId
          : undefined,
      creationDateFrom: this.filters.creationDateFrom || undefined,
      creationDateTo: this.filters.creationDateTo || undefined,
    };

    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    this.userService
      .filterUsers(payload, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.users = (res.content || []).map((u: any) => ({
            id: u.id,
            fullName: `${u.firstName} ${u.lastName}`,
            identification: u.identification,
            email: u.email,
            role: this.mapRole(u.role),
            status: u.enabledStatus ? 'ACTIVO' : 'INACTIVO',
            position: u.position?.name || '—',
            creationDate: u.creationDate,
          }));

          this.totalPages = res.totalPages || 0;
          this.noResults = this.users.length === 0;
          this.loading = false;
        },
        error: () => {
          this.users = [];
          this.totalPages = 0;
          this.noResults = true;
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
      creationDateFrom: '',
      creationDateTo: '',
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
    if (this.lastFilters.creationDateFrom)
      parts.push(`fecha desde "${this.lastFilters.creationDateFrom}"`);
    if (this.lastFilters.creationDateTo)
      parts.push(`fecha hasta "${this.lastFilters.creationDateTo}"`);

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
    const newStatus = this.selectedUser.status !== 'ACTIVO';
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
      ? 'PERSONAL AUTORIZADO'
      : r === 'QUALITY-ADMIN-USER'
      ? 'ANALISTA DE CALIDAD'
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
  private getEnabledStatusValue(status: string): boolean | undefined {
    if (status === 'ACTIVO') return true;
    if (status === 'INACTIVO') return false;
    return undefined;
  }
}
