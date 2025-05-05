// personal-session-history.component.ts
import { Component, OnInit } from '@angular/core';
import { EquipmentUseService } from '../../../../core/session/services/equipment-use.service';
import { UserService } from '../../../../core/user/services/user.service';
import { FieldConfig } from '../../../../shared/model/field-config.model';
import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { decodeToken } from '../../../../core/auth/services/token.utils';

interface SessionRecord {
  id: number;
  equipment: string;
  lab: string;
  labName: string;
  inventoryCode: string;
  date: string;
  time: string;
  verifiedStatus: string;
  usageStatus: string;
  usageDuration?: string;
  sampleCount?: number;
  functionsUsed?: string[];
  observations?: string;
  inProgress: boolean;
  startDateTime: string;
}

@Component({
  selector: 'app-personal-session-history',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchAdvancedComponent],
  templateUrl: './personal-session-history.component.html',
  styleUrls: ['./personal-session-history.component.scss'],
})
export class PersonalSessionHistoryComponent implements OnInit {
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
  };

  sessionRecords: SessionRecord[] = [];
  availableLabs: string[] = [];
  availableEquipments: string[] = [];
  availableFunctions: string[] = [];

  availableFilterKeys = [
    { key: 'equipment', label: 'Equipo / Patrón' },
    { key: 'lab', label: 'Laboratorio' },
    { key: 'verifiedStatus', label: 'Verificado' },
    { key: 'usageStatus', label: 'Para uso' },
    { key: 'sampleCountMin', label: 'Muestras desde' },
    { key: 'sampleCountMax', label: 'Muestras hasta' },
    { key: 'function', label: 'Función' },
  ];
  activeFilterKeys = this.availableFilterKeys.map((f) => f.key);

  fieldsConfig: FieldConfig[] = [
    {
      key: 'equipment',
      label: 'Equipo / Patrón',
      type: 'dropdown',
      allowEmptyOption: 'Todos',
    },
    {
      key: 'lab',
      label: 'Laboratorio',
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
      options: ['SI', 'NO'],
      allowEmptyOption: 'Todos',
    },
    {
      key: 'sampleCountMin',
      label: 'Muestras desde',
      type: 'number',
      placeholder: 'Desde',
    },
    {
      key: 'sampleCountMax',
      label: 'Muestras hasta',
      type: 'number',
      placeholder: 'Hasta',
    },
    {
      key: 'function',
      label: 'Función utilizada',
      type: 'dropdown',
      allowEmptyOption: 'Todas',
    },
  ];

  get options() {
    return {
      lab: this.availableLabs,
      equipment: this.availableEquipments,
      function: this.availableFunctions,
    };
  }

  constructor(
    private sessionService: EquipmentUseService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const decoded: any = decodeToken(token);
    const email = decoded?.email || decoded?.preferred_username;

    if (email) {
      this.userService.getUserByEmail(email).subscribe({
        next: (user) => this.loadSessions(user.id),
      });
    }
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
          match(session.labName, this.filters.lab) &&
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
              (f) => f.toLowerCase() === this.filters.function.toLowerCase()
            ))
        );
      })
      .sort((a, b) =>
        this.sortAscending
          ? new Date(a.startDateTime).getTime() -
            new Date(b.startDateTime).getTime()
          : new Date(b.startDateTime).getTime() -
            new Date(a.startDateTime).getTime()
      );
  }

  onFiltersChange(updated: Partial<typeof this.filters>): void {
    this.filters = { ...this.filters, ...updated };
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
    };
    this.searchQuery = '';
  }

  selectSession(session: SessionRecord): void {
    this.selectedSession = session;
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  calculateDuration(start: string, end: string | null): string {
    if (!start || !end) return 'En curso';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    if (diff <= 0) return '00:00:00';
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  loadFilterOptions(): void {
    this.sessionService.getAllEquipmentUses().subscribe({
      next: (sessions) => {
        const allLabs = new Set<string>();
        const allEquipments = new Set<string>();
        const allFunctions = new Set<string>();
        sessions.forEach((s) => {
          allLabs.add(s.equipment.laboratory.laboratoryName);
          allEquipments.add(s.equipment.equipmentName);
          s.usedFunctions?.forEach((f) => allFunctions.add(f.functionName));
        });
        this.availableLabs = Array.from(allLabs);
        this.availableEquipments = Array.from(allEquipments);
        this.availableFunctions = Array.from(allFunctions);
      },
    });
  }

  loadSessions(userId: number): void {
    this.isLoading = true;
    this.sessionService.getAllEquipmentUses().subscribe({
      next: (sessions) => {
        this.sessionRecords = sessions
          .filter((s) => s.user.id === userId)
          .map((s) => {
            const inProgress = s.isInUse;
            return {
              id: s.id,
              equipment: s.equipment.equipmentName,
              lab: `${s.equipment.laboratory.laboratoryName} - ${s.equipment.laboratory.location.locationName}`,
              labName: s.equipment.laboratory.laboratoryName,
              inventoryCode: s.equipment.inventoryNumber,
              date: this.formatDate(s.startUseTime),
              time: this.formatTime(s.startUseTime),
              verifiedStatus: s.isVerified ? 'SI' : 'NO',
              usageStatus: s.isAvailable ? 'SI' : 'NO',
              usageDuration: inProgress
                ? 'En curso'
                : this.calculateDuration(s.startUseTime, s.endUseTime),
              sampleCount: inProgress ? undefined : s.samplesNumber,
              functionsUsed: inProgress
                ? undefined
                : s.usedFunctions?.map((f) => f.functionName),
              observations: inProgress ? undefined : s.observations || 'N/A',
              inProgress,
              startDateTime: s.startUseTime,
            };
          });
        this.isLoading = false;
      },
      error: () => {
        this.sessionRecords = [];
        this.isLoading = false;
      },
    });
  }
}
