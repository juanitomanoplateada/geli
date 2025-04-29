import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownFilterComponent } from '../../../../shared/components/dropdown-filter/dropdown-filter.component';
import { IntegerOnlyDirective } from '../../../../shared/directives/integer-only/integer-only.directive';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component'; // Importamos el nuevo

interface SessionRecord {
  id: number;
  lab: string;
  equipment: string;
  date: string;
  time: string;
  verifiedStatus: string;
  responsible: string;
  email: string;
  usageStatus: string;
  usageDuration?: number;
  sampleCount?: number;
  functionsUsed?: string[];
  observations?: string;
}

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownFilterComponent,
    IntegerOnlyDirective,
    UppercaseDirective,
    SearchAdvancedComponent, // ✅ nuevo
  ],
  templateUrl: './session-history.component.html',
  styleUrls: ['./session-history.component.scss'],
})
export class SessionHistoryComponent {
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
    user: '', // <-- aquí importante
  };

  sessionRecords: SessionRecord[] = [
    {
      id: 1,
      lab: 'Laboratorio de DRX',
      equipment: 'Difractómetro PANalytical',
      date: '2025-04-09',
      time: '08:30',
      verifiedStatus: 'SI',
      responsible: 'RAMIREZ RAMIREZ',
      email: 'ramirez@uptc.edu.co',
      usageStatus: 'Disponible',
      usageDuration: 120,
      sampleCount: 5,
      functionsUsed: ['Medición', 'Calibración'],
      observations: 'Equipo en buen estado',
    },
    {
      id: 2,
      lab: 'Laboratorio de Electrónica',
      equipment: 'Fuente DC BK Precision',
      date: '2025-04-08',
      time: '10:45',
      verifiedStatus: 'NO',
      responsible: 'LOPEZ GARCIA',
      email: 'lopez@uptc.edu.co',
      usageStatus: 'No disponible',
      usageDuration: 60,
      sampleCount: 3,
      functionsUsed: ['Alimentación continua'],
      observations: 'Fuente sin salida en canal 2',
    },
  ];

  availableLabs = ['Laboratorio de DRX', 'Laboratorio de Electrónica'];
  availableEquipments = [
    'Difractómetro PANalytical',
    'Fuente DC BK Precision',
    'Osciloscopio Tektronix',
  ];
  availableFunctions = ['Medición', 'Calibración', 'Alimentación continua'];
  availableUsers = Array.from(
    new Set(this.sessionRecords.map((s) => s.responsible))
  );

  // 💥 Nueva configuración dinámica de filtros
  filtersConfig = [
    {
      key: 'lab',
      type: 'dropdown',
      label: 'Laboratorio',
      options: this.availableLabs,
    },
    {
      key: 'equipment',
      type: 'dropdown',
      label: 'Equipo / Patrón',
      options: this.availableEquipments,
    },
    {
      key: 'verifiedStatus',
      type: 'select',
      label: 'Estado - Verificado',
      options: ['SI', 'NO'],
    },
    {
      key: 'usageStatus',
      type: 'select',
      label: 'Estado - Para uso',
      options: ['Disponible', 'No disponible'],
    },
    {
      key: 'function',
      type: 'dropdown',
      label: 'Función utilizada',
      options: this.availableFunctions,
    },
    {
      key: 'user',
      type: 'dropdown',
      label: 'Responsable',
      options: this.availableUsers,
    },
    { key: 'dateFrom', type: 'date', label: 'Fecha desde' },
    { key: 'dateTo', type: 'date', label: 'Fecha hasta' },
    { key: 'timeFrom', type: 'time', label: 'Hora desde' },
    { key: 'timeTo', type: 'time', label: 'Hora hasta' },
    {
      key: 'usageDurationMin',
      type: 'number',
      label: 'Tiempo de uso desde (min)',
    },
    {
      key: 'usageDurationMax',
      type: 'number',
      label: 'Tiempo de uso hasta (min)',
    },
    { key: 'sampleCountMin', type: 'number', label: 'Muestras desde' },
    { key: 'sampleCountMax', type: 'number', label: 'Muestras hasta' },
  ];

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
            session.usageDuration,
            this.filters.usageDurationMin,
            this.filters.usageDurationMax
          ) &&
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

  onSearch(): void {
    this.isLoading = true;
    setTimeout(() => (this.isLoading = false), 300);
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.onSearch();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  selectSession(session: SessionRecord): void {
    this.selectedSession = session;
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

  get functionsUsedDisplay(): string {
    if (!this.selectedSession?.functionsUsed?.length) {
      return 'NO APLICA';
    }
    return this.selectedSession.functionsUsed.join(', ').toUpperCase();
  }

}
