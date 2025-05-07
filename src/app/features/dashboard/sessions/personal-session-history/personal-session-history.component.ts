import {
  EquipmentUseFilterRequest,
  EquipmentUseResponse,
  EquipmentUseService,
} from './../../../../core/session/services/equipment-use.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchAdvancedComponent } from '../../../../shared/components/search-advanced/search-advanced.component';
import { FieldConfig } from '../../../../shared/model/field-config.model';
import { LaboratoryService } from '../../../../core/laboratory/services/laboratory.service';
import { EquipmentService } from '../../../../core/equipment/services/equipment.service';
import {
  FunctionDto,
  FunctionService,
} from '../../../../core/function/services/function.service';
import {
  UserRecordResponse,
  UserService,
} from '../../../../core/user/services/user.service';
import { Laboratory } from '../../../../core/laboratory/models/laboratory.model';
import { EquipmentDto } from '../../../../core/equipment/models/equipment-response.dto';
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
  responsible: string;
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
    sessionStatus: '',
  };

  sessionRecords: SessionRecord[] = [];

  availableLabs: string[] = [];
  availableEquipments: string[] = [];
  availableFunctions: string[] = [];

  labsFull: Laboratory[] = [];
  equipmentsFull: EquipmentDto[] = [];
  functionsFull: FunctionDto[] = [];
  userId: number | null = null;

  availableFilterKeys = [
    { key: 'sessionStatus', label: 'Estado de la sesión' },
    { key: 'equipment', label: 'Equipo / Patrón' },
    { key: 'lab', label: 'Laboratorio' },
    { key: 'dateFrom', label: 'Fecha desde' },
    { key: 'dateTo', label: 'Fecha hasta' },
    { key: 'timeFrom', label: 'Hora desde' },
    { key: 'timeTo', label: 'Hora hasta' },
    { key: 'verifiedStatus', label: 'Verificado' },
    { key: 'usageStatus', label: 'Para uso' },
    { key: 'sampleCountMin', label: 'Muestras desde' },
    { key: 'sampleCountMax', label: 'Muestras hasta' },
    { key: 'function', label: 'Función' },
  ];
  activeFilterKeys = this.availableFilterKeys.map((f) => f.key);

  fieldsConfig: FieldConfig[] = [
    {
      key: 'sessionStatus',
      label: 'Estado de la sesión',
      type: 'select',
      options: ['En curso', 'Finalizada'],
      allowEmptyOption: 'Todas',
    },
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
      key: 'dateFrom',
      label: 'Fecha desde',
      type: 'date',
      placeholder: 'YYYY-MM-DD',
    },
    {
      key: 'dateTo',
      label: 'Fecha hasta',
      type: 'date',
      placeholder: 'YYYY-MM-DD',
    },
    {
      key: 'timeFrom',
      label: 'Hora desde',
      type: 'time',
      placeholder: 'HH:mm:ss',
    },
    {
      key: 'timeTo',
      label: 'Hora hasta',
      type: 'time',
      placeholder: 'HH:mm:ss',
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

  constructor(
    private equipmentUseService: EquipmentUseService,
    private labService: LaboratoryService,
    private equipmentService: EquipmentService,
    private functionService: FunctionService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    const decoded: any = decodeToken(token);
    const email = decoded?.email || decoded?.preferred_username;
    if (!email) return;

    this.userService.getUserByEmail(email).subscribe({
      next: (user) => {
        this.userId = user.id;
        this.loadFilterOptions();
        this.onSearch();
      },
    });
  }

  get filteredSessions(): SessionRecord[] {
    const query = this.searchQuery.toLowerCase();
    return this.sessionRecords
      .filter((session) => {
        return (
          session.inventoryCode.toLowerCase().includes(query) ||
          session.equipment.toLowerCase().includes(query) ||
          session.lab.toLowerCase().includes(query) ||
          session.responsible.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const timeA = new Date(a.startDateTime).getTime();
        const timeB = new Date(b.startDateTime).getTime();
        return this.sortAscending ? timeA - timeB : timeB - timeA;
      });
  }

  loadFilterOptions(): void {
    this.labService.getLaboratories().subscribe({
      next: (labs) => {
        this.labsFull = labs;
        this.availableLabs = labs.map((lab) => lab.laboratoryName);
      },
    });

    this.equipmentService.getAll().subscribe({
      next: (equipments) => {
        this.equipmentsFull = equipments;
        this.availableEquipments = equipments.map(
          (e) => `${e.equipmentName} - ${e.inventoryNumber}`
        );
      },
    });

    this.functionService.getAll().subscribe({
      next: (functions) => {
        this.functionsFull = functions;
        this.availableFunctions = functions.map((f) => f.functionName);
      },
    });
  }

  onSearch(): void {
    if (!this.userId) return;
    const request: EquipmentUseFilterRequest = {
      ...this.filters,
      isInUse:
        this.filters.sessionStatus === 'En curso'
          ? true
          : this.filters.sessionStatus === 'Finalizada'
          ? false
          : null,
      isVerified:
        this.filters.verifiedStatus === ''
          ? null
          : this.filters.verifiedStatus === 'SI'
          ? true
          : false,
      isAvailable:
        this.filters.usageStatus === ''
          ? null
          : this.filters.usageStatus === 'SI'
          ? true
          : false,
      samplesNumberFrom: this.filters.sampleCountMin ?? undefined,
      samplesNumberTo: this.filters.sampleCountMax ?? undefined,
      useDateFrom:
        this.combineDateTime(this.filters.dateFrom, this.filters.timeFrom) ??
        undefined,
      useDateTo:
        this.combineDateTime(this.filters.dateTo, this.filters.timeTo) ??
        undefined,
      startUseTimeFrom:
        this.combineDateTime(this.filters.dateFrom, this.filters.timeFrom) ??
        undefined,
      endUseTimeTo:
        this.combineDateTime(this.filters.dateTo, this.filters.timeTo) ??
        undefined,
      usedFunctionsIds: this.filters.function
        ? this.getFunctionIdByName(this.filters.function)
        : undefined,
      equipmentId: this.getEquipmentIdByInventoryCode(this.filters.equipment),
      laboratoryId: this.getLabIdByName(this.filters.lab),
      userId: this.userId,
    };

    this.isLoading = true;
    this.equipmentUseService.filter(request).subscribe({
      next: (response) => {
        const safeResponse = response ?? [];
        this.sessionRecords = this.mapSessions(safeResponse);
        this.selectedSession =
          this.sessionRecords.length > 0 ? this.sessionRecords[0] : null;
        this.isLoading = false;
      },
      error: () => {
        this.sessionRecords = [];
        this.selectedSession = null;
        this.isLoading = false;
      },
    });
  }

  combineDateTime(date: string, time: string): string | null {
    if (!date) return null;
    const timePart = time || '00:00:00';
    return `${date}T${timePart}`;
  }

  onFiltersChange(updated: Partial<typeof this.filters>): void {
    this.filters = { ...this.filters, ...updated };
    this.onSearch();
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
      sessionStatus: '',
    };
    this.searchQuery = '';
    this.onSearch();
  }

  mapSessions(response: EquipmentUseResponse[]): SessionRecord[] {
    if (!response) return [];
    return response.map((session) => {
      const inProgress = session.isInUse;
      const usageDuration = this.calculateDuration(
        session.startUseTime,
        session.endUseTime
      );
      return {
        id: session.id,
        equipment: session.equipment.equipmentName,
        lab: `${session.equipment.laboratory.laboratoryName} - ${session.equipment.laboratory.location.locationName}`,
        labName: session.equipment.laboratory.laboratoryName,
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
        observations: inProgress ? undefined : session.observations || 'N/A',
        responsible: `${session.user.firstName} ${session.user.lastName}`,
        inProgress,
        startDateTime: session.startUseTime,
      };
    });
  }

  getEquipmentIdByInventoryCode(displayText: string): number | undefined {
    const inventoryCode = displayText.split(' - ').at(-1)?.trim();
    return this.equipmentsFull.find((e) => e.inventoryNumber === inventoryCode)
      ?.id;
  }

  getLabIdByName(name: string): number | undefined {
    return this.labsFull.find(
      (l) => l.laboratoryName.toLowerCase() === name.toLowerCase()
    )?.id;
  }

  getFunctionIdByName(name: string): number[] | undefined {
    const fn = this.functionsFull.find(
      (f) => f.functionName.toLowerCase() === name.toLowerCase()
    );
    return fn ? [fn.id] : undefined;
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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

  selectSession(session: SessionRecord): void {
    this.selectedSession = session;
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
}
