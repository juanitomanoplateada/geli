import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Models and DTOs
import { FieldConfig } from '../../../../shared/model/field-config.model';
import { FunctionDto } from '../../../../core/function/services/function.service';
import { UserRecordResponse } from '../../../../core/dto/user/record-user-response.dto';
import { LaboratoryResponseDto } from '../../../../core/dto/laboratory/laboratory-response.dto';
import { EquipmentDto } from '../../../../core/dto/equipments-patterns/equipment-response.dto';
import { SessionRecord } from '../../../../core/dto/session/session-record.dto';
import {
  EquipmentUseFilterRequest,
  EquipmentUseResponse,
} from './../../../../core/services/session/equipment-use.service';

// Services
import { LaboratoryService } from '../../../../core/services/laboratory/laboratory.service';
import { EquipmentService } from '../../../../core/services/equipment/equipment.service';
import { FunctionService } from './../../../../core/services/function/function.service';
import { UserService } from '../../../../core/services/user/user.service';
import { EquipmentUseService } from '../../../../core/services/session/equipment-use.service';

// Components
import { SearchFilterOnlyComponent } from '../../../../shared/components/search-filter-only/search-filter-only.component';

// Constants
import {
  AVAILABLE_FILTER_KEYS,
  DEFAULT_EQUIPMENT_USE_FILTERS,
} from './equipment-use-filters.const';
import { EQUIPMENT_USE_FIELDS_CONFIG } from './equipment-use-fields-config.const';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchFilterOnlyComponent],
  templateUrl: './session-history.component.html',
  styleUrls: ['./session-history.component.scss'],
})
export class SessionHistoryComponent implements OnInit {
  // Component State
  searchQuery = '';
  isLoading = false;
  showAdvancedSearch = false;
  sortAscending = false;
  selectedSession: SessionRecord | null = null;
  filters = { ...DEFAULT_EQUIPMENT_USE_FILTERS };

  // Data Collections
  sessionRecords: SessionRecord[] = [];
  labsFull: LaboratoryResponseDto[] = [];
  codesInventoryFull: EquipmentDto[] = [];
  equipmentsFull: EquipmentDto[] = [];
  functionsFull: FunctionDto[] = [];
  usersFull: UserRecordResponse[] = [];

  // Filter Options
  availableLabs: string[] = [];
  codesInventory: string[] = [];
  availableEquipments: string[] = [];
  availableFunctions: string[] = [];
  availableUsers: string[] = [];
  availableFilterKeys = AVAILABLE_FILTER_KEYS;
  activeFilterKeys: string[] = [];
  fieldsConfig: FieldConfig[] = EQUIPMENT_USE_FIELDS_CONFIG;

  // Pagination
  currentPage = 0;
  totalPages = 0;
  pageSize = 5;
  pageSizeOptions = [5, 15, 30, 50, 100];

  constructor(
    private equipmentUseService: EquipmentUseService,
    private labService: LaboratoryService,
    private equipmentService: EquipmentService,
    private functionService: FunctionService,
    private userService: UserService
  ) {}

  // Lifecycle Hooks
  ngOnInit(): void {
    this.loadFilterOptions();
    this.onSearch(); // Initial load
    setInterval(() => {
      this.updateRealTimeDurations();
    }, 1000);
  }

  // Public Methods
  get filteredSessions(): SessionRecord[] {
    return this.sessionRecords.sort((a, b) => {
      const timeA = new Date(a.startDateTime).getTime();
      const timeB = new Date(b.startDateTime).getTime();
      return this.sortAscending ? timeA - timeB : timeB - timeA;
    });
  }

  onSearch(): void {
    const request = this.buildFilterRequest();
    this.isLoading = true;

    this.equipmentUseService
      .filter(request, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => this.handleSearchSuccess(response),
        error: () => this.handleSearchError(),
      });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.onSearch();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.onSearch();
  }

  onFiltersChange(updated: Partial<typeof this.filters>): void {
    this.filters = { ...this.filters, ...updated };
    this.currentPage = 0;
    this.onSearch();
  }

  clearFilters(): void {
    this.filters = { ...DEFAULT_EQUIPMENT_USE_FILTERS };
    this.searchQuery = '';
    this.currentPage = 0;
    this.onSearch();
  }

  selectSession(session: SessionRecord): void {
    this.selectedSession = session;
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  // Data Loading Methods
  loadFilterOptions(): void {
    this.loadLaboratories();
    this.loadEquipmentInventory();
    this.loadEquipmentNames();
    this.loadFunctions();
    this.loadAuthorizedUsers();
  }

  // Helper Methods
  private buildFilterRequest(): EquipmentUseFilterRequest {
    return {
      isInUse: this.getSessionStatusFilter(),
      isVerified: this.getVerifiedStatusFilter(),
      isAvailable: this.getUsageStatusFilter(),
      samplesNumberFrom: this.filters.sampleCountMin ?? undefined,
      samplesNumberTo: this.filters.sampleCountMax ?? undefined,
      useDateFrom: this.filters.dateFrom,
      useDateTo: this.filters.dateTo,
      startTimeFrom: this.filters.timeFrom,
      endTimeTo: this.filters.timeTo,
      usedFunctionsIds: this.filters.function
        ? this.getFunctionIdByName(this.filters.function)
        : undefined,
      equipmentInventoryCode: this.filters.codeInventory,
      equipmentName: this.filters.equipment,
      userId: this.getUserIdByFullName(this.filters.user),
      laboratoryId: this.getLabIdByName(this.filters.lab),
    };
  }

  private getSessionStatusFilter(): boolean | null {
    return this.filters.sessionStatus === 'EN CURSO'
      ? true
      : this.filters.sessionStatus === 'FINALIZADA'
      ? false
      : null;
  }

  private getVerifiedStatusFilter(): boolean | null {
    return this.filters.verifiedStatus === ''
      ? null
      : this.filters.verifiedStatus === 'SI'
      ? true
      : false;
  }

  private getUsageStatusFilter(): boolean | null {
    return this.filters.usageStatus === ''
      ? null
      : this.filters.usageStatus === 'SI'
      ? true
      : false;
  }

  // Data Mapping Methods
  private mapSessions(response: EquipmentUseResponse[]): SessionRecord[] {
    if (!response) return [];
    return response.map((session) => this.mapSingleSession(session));
  }

  private mapSingleSession(session: EquipmentUseResponse): SessionRecord {
    const inProgress = session.isInUse;
    const usageDuration = this.calculateDuration(
      session.startUseTime,
      session.endUseTime
    );

    return {
      id: session.id,
      equipment: session.equipment.equipmentName,
      lab: `${session.equipment.laboratory.laboratoryName}`,
      labName: session.equipment.laboratory.laboratoryName,
      inventoryCode: session.equipment.inventoryNumber,
      date: this.formatDate(session.startUseTime),
      time: this.formatTime(session.startUseTime),
      verifiedStatus: session.isVerified ? 'SI' : 'NO',
      usageStatus: session.isAvailable ? 'SI' : 'NO',
      usageDuration: inProgress ? 'EN CURSO' : usageDuration,
      sampleCount: inProgress ? undefined : session.samplesNumber,
      functionsUsed: inProgress
        ? undefined
        : session.usedFunctions?.map((f) => f.functionName),
      observations: inProgress ? undefined : session.observations || 'N/A',
      responsible: `${session.user.firstName} ${session.user.lastName}`,
      inProgress,
      startDateTime: session.startUseTime,
    };
  }

  // Data Loading Handlers
  private loadLaboratories(): void {
    this.labService.getLaboratories().subscribe({
      next: (labs) => {
        this.labsFull = labs;
        this.availableLabs = labs.map((lab) => lab.laboratoryName);
      },
    });
  }

  private loadEquipmentInventory(): void {
    this.equipmentService.getAll().subscribe({
      next: (response) => {
        const safeEquipments = Array.isArray(response.content)
          ? response.content
          : [];
        this.codesInventoryFull = safeEquipments;
        this.codesInventory = safeEquipments.map((e) => `${e.inventoryNumber}`);
      },
      error: () => {
        this.equipmentsFull = [];
        this.availableEquipments = [];
      },
    });
  }

  private loadEquipmentNames(): void {
    this.equipmentService.getAll().subscribe({
      next: (response) => {
        const safeEquipments = Array.isArray(response.content)
          ? response.content
          : [];
        this.equipmentsFull = safeEquipments;
        this.availableEquipments = safeEquipments.map((e) => e.equipmentName);
      },
      error: () => {
        this.equipmentsFull = [];
        this.availableEquipments = [];
      },
    });
  }

  private loadFunctions(): void {
    this.functionService.getAll().subscribe({
      next: (functions) => {
        this.functionsFull = functions;
        this.availableFunctions = functions.map((f) => f.functionName);
      },
    });
  }

  private loadAuthorizedUsers(): void {
    const payload = { role: 'AUTHORIZED-USER' };
    this.userService.filterUsers(payload, 0, 9999).subscribe({
      next: (res) => {
        this.usersFull = res.content || [];
        this.availableUsers = this.usersFull.map(
          (u) => `${u.id} - ${u.firstName} ${u.lastName}`
        );
      },
      error: (err) => {
        console.error('Error al cargar usuarios autorizados', err);
        this.usersFull = [];
      },
    });
  }

  // Search Handlers
  private handleSearchSuccess(response: any): void {
    const content = response?.content ?? [];
    this.sessionRecords = this.mapSessions(content);
    this.selectedSession =
      this.sessionRecords.length > 0 ? this.sessionRecords[0] : null;
    this.isLoading = false;
    this.totalPages = response.totalPages || 0;
  }

  private handleSearchError(): void {
    this.sessionRecords = [];
    this.selectedSession = null;
    this.totalPages = 0;
    this.isLoading = false;
  }

  // Utility Methods
  private getLabIdByName(name: string): number | undefined {
    return this.labsFull.find(
      (l) => l.laboratoryName.toLowerCase() === name.toLowerCase()
    )?.id;
  }

  private getEquipmentIdByName(name: string): number | undefined {
    return this.equipmentsFull.find(
      (e) => e.equipmentName.toLowerCase() === name.toLowerCase()
    )?.id;
  }

  private getUserIdByFullName(fullNameWithId: string): number | undefined {
    const idStr = fullNameWithId.split(' - ')[0].trim();
    const id = Number(idStr);
    return isNaN(id) ? undefined : this.usersFull.find((u) => u.id === id)?.id;
  }

  private getFunctionIdByName(name: string): number[] | undefined {
    const fn = this.functionsFull.find(
      (f) => f.functionName.toLowerCase() === name.toLowerCase()
    );
    return fn ? [fn.id] : undefined;
  }

  // Date/Time Methods
  private formatDate(isoDate: string): string {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private formatTime(isoDate: string): string {
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

  private calculateDuration(start: string, end: string | null): string {
    if (!start || !end) return 'EN CURSO';

    const diff = new Date(end).getTime() - new Date(start).getTime();
    if (diff <= 0) return '00s';

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (days > 0)
      return `${pad(days)}d ${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;
    if (hours > 0) return `${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;
    if (minutes > 0) return `${pad(minutes)}m:${pad(seconds)}s`;
    return `${pad(seconds)}s`;
  }

  // Real-time Updates
  private updateRealTimeDurations(): void {
    const now = new Date();
    this.sessionRecords.forEach((session) => {
      if (session.inProgress && session.startDateTime) {
        session.usageDuration = this.calculateInProgressDuration(
          now,
          new Date(session.startDateTime)
        );
      }
    });
  }

  private calculateInProgressDuration(now: Date, start: Date): string {
    const diff = now.getTime() - start.getTime();

    if (diff > 0) {
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');

      if (days > 0) {
        return `${pad(days)}d ${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;
      } else if (hours > 0) {
        return `${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;
      } else if (minutes > 0) {
        return `${pad(minutes)}m:${pad(seconds)}s`;
      } else {
        return `${pad(seconds)}s`;
      }
    }
    return '00s';
  }
}
