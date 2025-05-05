import {
  EquipmentUseResponse,
  EquipmentUseService,
} from './../../../../core/session/services/equipment-use.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component';
import { FieldConfig } from '../../../../shared/model/field-config.model';

interface SessionRecord {
  id: number;
  equipment: string;
  lab: string;
  inventoryCode: string;
  date: string;
  time: string;
  verifiedStatus: string;
  usageStatus: string;
  usageDuration?: string;
  sampleCount?: number;
  functionsUsed?: string[];
  observations?: string;
  responsible: string;
  inProgress: boolean; // NUEVO
}

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchAdvancedComponent],
  templateUrl: './session-history.component.html',
  styleUrls: ['./session-history.component.scss'],
})
export class SessionHistoryComponent implements OnInit {
  searchQuery = '';
  isLoading = false;
  showAdvancedSearch = false;
  sortAscending = true;
  selectedSession: SessionRecord | null = null;

  filters = {
    lab: '',
    equipment: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    verifiedStatus: '',
    usageStatus: '',
    usageDurationMin: null as number | null,
    usageDurationMax: null as number | null,
    sampleCountMin: null as number | null,
    sampleCountMax: null as number | null,
    function: '',
    user: '',
  };

  sessionRecords: SessionRecord[] = [];
  allSessions: EquipmentUseResponse[] = [];

  availableLabs: string[] = [];
  availableEquipments: string[] = [];
  availableFunctions: string[] = [];
  availableUsers: string[] = [];

  constructor(private equipmentUseService: EquipmentUseService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.isLoading = true;

    this.equipmentUseService.getAllEquipmentUses().subscribe({
      next: (response) => {
        this.sessionRecords = response.map((session) => {
          const inProgress = session.isInUse;
          const usageDuration = this.calculateDuration(
            session.startUseTime,
            session.endUseTime
          );

          return {
            id: session.id,
            equipment: session.equipment.equipmentName,
            lab: `${session.equipment.laboratory.laboratoryName} - ${session.equipment.laboratory.location.locationName}`,
            inventoryCode: session.equipment.inventoryNumber,
            date: this.formatDate(session.startUseTime),
            time: this.formatTime(session.startUseTime),
            verifiedStatus: session.isVerified ? 'SI' : 'NO',
            usageStatus: session.isAvailable ? 'SI' : 'NO',
            usageDuration: inProgress ? 'En curso' : usageDuration,
            sampleCount: inProgress ? undefined : session.samplesNumber,
            functionsUsed: inProgress
              ? undefined
              : session.usedFunctions?.map((f) => f.functionName),
            observations: inProgress
              ? undefined
              : session.observations || 'N/A',
            responsible: `${session.user.firstName} ${session.user.lastName}`,
            inProgress,
          };
        });

        this.onSearch(); // actualiza resultados filtrados
        this.isLoading = false;
      },
      error: () => {
        this.sessionRecords = [];
        this.isLoading = false;
      },
    });
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }

  formatTime(isoDate: string): string {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Bogota',
    });
  }

  calculateDuration(start: string, end: string | null): string {
    if (!start || !end) return 'En curso';

    const diff = new Date(end).getTime() - new Date(start).getTime();
    if (diff <= 0) return '00:00:00:00';

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  calculateMinutes(start: string, end: string | null): number | undefined {
    if (!start || !end) return undefined;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  }

  onSearch(): void {
    // Ya que sessionRecords es dinámico, los filtros se aplican sobre él en `filteredSessions`
  }

  onFiltersChange(updated: Partial<typeof this.filters>): void {
    this.filters = { ...this.filters, ...updated };
    this.onSearch();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  clearFilters(): void {
    this.filters = {
      lab: '',
      equipment: '',
      dateFrom: '',
      dateTo: '',
      timeFrom: '',
      timeTo: '',
      verifiedStatus: '',
      usageStatus: '',
      usageDurationMin: null,
      usageDurationMax: null,
      sampleCountMin: null,
      sampleCountMax: null,
      function: '',
      user: '',
    };
    this.searchQuery = '';
    this.onSearch();
  }

  get filteredSessions(): SessionRecord[] {
    return this.sessionRecords
      .filter((session) => {
        const match = (val: string, filter: string) =>
          !filter || val.toLowerCase() === filter.toLowerCase();

        const includes = (val: string, query: string) =>
          val.toLowerCase().includes(query.toLowerCase());

        const rangeMatch = (
          value: number | undefined,
          min: number | null,
          max: number | null
        ) =>
          (min === null || (value ?? 0) >= min) &&
          (max === null || (value ?? 0) <= max);

        return (
          (includes(session.lab, this.searchQuery) ||
            includes(session.equipment, this.searchQuery)) &&
          match(session.lab, this.filters.lab) &&
          match(session.equipment, this.filters.equipment) &&
          (!this.filters.dateFrom || session.date >= this.filters.dateFrom) &&
          (!this.filters.dateTo || session.date <= this.filters.dateTo) &&
          (!this.filters.timeFrom || session.time >= this.filters.timeFrom) &&
          (!this.filters.timeTo || session.time <= this.filters.timeTo) &&
          match(session.verifiedStatus, this.filters.verifiedStatus) &&
          match(session.usageStatus, this.filters.usageStatus) &&
          rangeMatch(
            session.sampleCount,
            this.filters.sampleCountMin,
            this.filters.sampleCountMax
          ) &&
          (!this.filters.function ||
            session.functionsUsed?.some(
              (func) =>
                func.toLowerCase() === this.filters.function.toLowerCase()
            )) &&
          match(session.responsible, this.filters.user)
        );
      })
      .sort((a, b) =>
        this.sortAscending
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date)
      );
  }

  options: any = {};

  availableFilterKeys = [
    { key: 'lab', label: 'Laboratorio' },
    { key: 'equipment', label: 'Equipo / Patrón' },
    { key: 'verifiedStatus', label: 'Verificado' },
    { key: 'usageStatus', label: 'Para uso' },
    { key: 'usageDurationMin', label: 'Tiempo uso desde' },
    { key: 'usageDurationMax', label: 'Tiempo uso hasta' },
    { key: 'sampleCountMin', label: 'Muestras desde' },
    { key: 'sampleCountMax', label: 'Muestras hasta' },
    { key: 'function', label: 'Función' },
    { key: 'user', label: 'Responsable' },
    { key: 'dateFrom', label: 'Fecha desde' },
    { key: 'dateTo', label: 'Fecha hasta' },
    { key: 'timeFrom', label: 'Hora desde' },
    { key: 'timeTo', label: 'Hora hasta' },
  ];
  activeFilterKeys = this.availableFilterKeys.map((f) => f.key);

  fieldsConfig: FieldConfig[] = [
    {
      key: 'lab',
      label: 'Laboratorio',
      type: 'dropdown',
      allowEmptyOption: 'Todos',
    },
    {
      key: 'equipment',
      label: 'Equipo / Patrón',
      type: 'dropdown',
      allowEmptyOption: 'Todos',
    },
    {
      key: 'verifiedStatus',
      label: 'Estado - Verificado',
      type: 'select',
      options: ['SI', 'NO'],
      allowEmptyOption: 'Todos',
    },
    {
      key: 'usageStatus',
      label: 'Estado - Para uso',
      type: 'select',
      options: ['Disponible', 'No disponible'],
      allowEmptyOption: 'Todos',
    },
    {
      key: 'usageDurationMin',
      label: 'Tiempo uso desde (min)',
      type: 'number',
    },
    {
      key: 'usageDurationMax',
      label: 'Tiempo uso hasta (min)',
      type: 'number',
    },
    { key: 'sampleCountMin', label: 'Muestras desde', type: 'number' },
    { key: 'sampleCountMax', label: 'Muestras hasta', type: 'number' },
    {
      key: 'function',
      label: 'Función utilizada',
      type: 'dropdown',
      allowEmptyOption: 'Todas',
    },
    {
      key: 'user',
      label: 'Responsable',
      type: 'dropdown',
      allowEmptyOption: 'Todos',
    },
    { key: 'dateFrom', label: 'Fecha desde', type: 'date' },
    { key: 'dateTo', label: 'Fecha hasta', type: 'date' },
    { key: 'timeFrom', label: 'Hora desde', type: 'time' },
    { key: 'timeTo', label: 'Hora hasta', type: 'time' },
  ];

  selectSession(session: SessionRecord): void {
    this.selectedSession = session;
  }
}
