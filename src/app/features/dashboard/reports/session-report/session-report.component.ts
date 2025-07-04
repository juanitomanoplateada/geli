import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchFilterOnlyComponent } from '../../../../shared/components/search-filter-only/search-filter-only.component';
import { FieldConfig } from '../../../../shared/model/field-config.model';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Laboratory } from '../../../../core/dto/laboratory/laboratory.dto';
import { EquipmentDto } from '../../../../core/dto/equipments-patterns/equipment-response.dto';
import { FunctionDto } from '../../../../core/dto/function/function-response.dto';
import { UserRecordResponse } from '../../../../core/dto/user/record-user-response.dto';
import { EquipmentUseResponse } from '../../../../core/dto/session/session-response.dto';
import { LaboratoryService } from '../../../../core/services/laboratory/laboratory.service';
import { EquipmentService } from '../../../../core/services/equipment/equipment.service';
import { FunctionService } from '../../../../core/services/function/function.service';
import { UserService } from '../../../../core/services/user/user.service';
import { EquipmentUseService } from '../../../../core/services/session/equipment-use.service';
import { EquipmentUseFilterRequest } from '../../../../core/dto/session/session-filter-request.dto';
import {
  AVAILABLE_FILTER_KEYS,
  DEFAULT_EQUIPMENT_USE_FILTERS,
} from './equipment-use-filters.const';
import { EQUIPMENT_USE_FIELDS_CONFIG } from './equipment-use-fields-config.const';
import { SessionRecord } from '../../../../core/dto/session/session-record.dto';
import { LaboratoryResponseDto } from '../../../../core/dto/laboratory/laboratory-response.dto';

@Component({
  selector: 'app-session-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchFilterOnlyComponent,
    NgChartsModule,
  ],
  templateUrl: './session-report.component.html',
  styleUrls: ['./session-report.component.scss'],
})
export class SessionReportComponent implements OnInit {
  isLoading = false;

  filters = { ...DEFAULT_EQUIPMENT_USE_FILTERS };

  availableFilterKeys = AVAILABLE_FILTER_KEYS;

  activeFilterKeys: string[] = [];

  fieldsConfig: FieldConfig[] = EQUIPMENT_USE_FIELDS_CONFIG;

  activeTab:
    | 'estado'
    | 'historico'
    | 'hora'
    | 'laboratorio'
    | 'equipo'
    | 'codigo'
    | 'funcion'
    | 'usuario'
    | 'verificado'
    | 'paraUso'
    | 'muestras' = 'estado';

  availableLabs: string[] = [];
  availableEquipments: string[] = [];
  availableFunctions: string[] = [];
  availableUsers: string[] = [];
  codesInventory: string[] = [];

  sessionRecords: SessionRecord[] = [];
  labsFull: LaboratoryResponseDto[] = [];
  codesInventoryFull: EquipmentDto[] = [];
  equipmentsFull: EquipmentDto[] = [];
  functionsFull: FunctionDto[] = [];
  usersFull: UserRecordResponse[] = [];

  sessionStartDates: Date[] = [];
  usageLabels = ['Finalizadas', 'En Progreso'];
  usageData = [0, 0];
  laboratoryLabels: string[] = [];
  laboratoryData: number[] = [];
  equipmentLabels: string[] = [];
  equipmentData: number[] = [];
  inventoryCodeData: number[] = [];
  inventoryCodeLabels: string[] = [];
  functionLabels: string[] = [];
  functionData: number[] = [];
  sessionHourLabels: string[] = [];
  sessionHourData: number[] = [];
  userLabels: string[] = [];
  userData: number[] = [];
  verifiedLabels = ['SI', 'NO'];
  verifiedData = [0, 0];
  usageStatusLabels = ['SI', 'NO'];
  usageStatusData = [0, 0];
  sampleRangeLabels: string[] = ['0', '1–5', '6–10', '11–20', '21+'];
  sampleRangeData: number[] = [0, 0, 0, 0, 0];

  userUsageChartConfig!: ChartConfiguration<'bar'>;
  labUsageChartConfig!: ChartConfiguration<'bar'>;
  equipmentUsageChartConfig!: ChartConfiguration<'bar'>;
  inventoryCodeUsageChartConfig!: ChartConfiguration<'bar'>;
  functionUsageChartConfig!: ChartConfiguration<'bar'>;
  samplesChartConfig!: ChartConfiguration<'bar'>;
  sessionsByHourChartConfig!: ChartConfiguration<'bar'>;
  sessionTimelineChartConfig!: ChartConfiguration<'line'>;
  sessionStatusChartConfig!: ChartConfiguration<'pie'>;
  verifiedStatusChartConfig!: ChartConfiguration<'pie'>;
  usageStatusChartConfig!: ChartConfiguration<'pie'>;

  private chartColors: string[] = [
    '#007bff',
    '#28a745',
    '#ffc107',
    '#dc3545',
    '#6f42c1',
    '#17a2b8',
    '#fd7e14',
    '#20c997',
    '#6610f2',
    '#e83e8c',
    '#343a40',
    '#ff6384',
    '#36a2eb',
    '#cc65fe',
    '#ffce56',
    '#00c851',
    '#ffbb33',
    '#33b5e5',
  ];

  constructor(
    private labService: LaboratoryService,
    private equipmentService: EquipmentService,
    private functionService: FunctionService,
    private userService: UserService,
    private equipmentUseService: EquipmentUseService
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.onSearch();
  }

  getTotal(data: number[] | null | undefined): number {
    return Array.isArray(data) ? data.reduce((a, b) => a + b, 0) : 0;
  }

  // Data Loading Methods
  loadFilterOptions(): void {
    this.loadLaboratories();
    this.loadEquipmentInventory();
    this.loadEquipmentNames();
    this.loadFunctions();
    this.loadAuthorizedUsers();
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
    this.equipmentService.getAllForFilters().subscribe({
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
    this.equipmentService.getAllForFilters().subscribe({
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

  onFiltersChange(updated: Partial<typeof this.filters>): void {
    this.filters = { ...this.filters, ...updated };
    this.onSearch();
  }

  onSearch(): void {
    const request = this.buildFilterRequest();
    console.log(request);
    this.isLoading = true;

    this.equipmentUseService.filter(request, 0, 9999).subscribe({
      next: (response) => this.handleSearchSuccess(response),
      error: () => this.handleSearchError(),
    });
  }

  // Search Handlers
  private handleSearchSuccess(response: any): void {
    const content = response?.content ?? [];
    this.sessionRecords = this.mapSessions(content);
    this.processSessionDataFromSessionRecords();
    this.isLoading = false;
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

  private handleSearchError(): void {
    this.sessionRecords = [];
    this.isLoading = false;
  }

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

  combineDateTime(date: string, time: string): string | null {
    if (!date) return null;
    const timePart = time || '00:00:00';
    return `${date}T${timePart}`;
  }

  getLabIdByName(name: string): number | undefined {
    return this.labsFull.find(
      (l) => l.laboratoryName.toLowerCase() === name.toLowerCase()
    )?.id;
  }

  getEquipmentIdByInventoryCode(displayText: string): number | undefined {
    const inventoryCode = displayText.split(' - ').at(-1)?.trim();
    return this.equipmentsFull.find((e) => e.inventoryNumber === inventoryCode)
      ?.id;
  }

  private getUserIdByFullName(fullNameWithId: string): number | undefined {
    const idStr = fullNameWithId.split(' - ')[0].trim();
    const id = Number(idStr);
    return isNaN(id) ? undefined : this.usersFull.find((u) => u.id === id)?.id;
  }

  getFunctionIdByName(name: string): number[] | undefined {
    const fn = this.functionsFull.find(
      (f) => f.functionName.toLowerCase() === name.toLowerCase()
    );
    return fn ? [fn.id] : undefined;
  }

  clearFilters(): void {
    this.filters = { ...DEFAULT_EQUIPMENT_USE_FILTERS };
    this.onSearch();
  }

  exportToExcel(): void {
    const data = this.mapSessionRecordsToExport();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sesiones');

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    const fileName = `reporte_sesiones_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, '-')}.xlsx`;

    saveAs(blob, fileName);
  }

  exportToCSV(): void {
    /*const data = this.mapSessionRecordsToExport();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const fileName = `reporte_sesiones_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, '-')}.csv`;

    saveAs(blob, fileName);*/
  }

  private mapSessionRecordsToExport(): any[] {
    /*return this.sessionRecords.map((s) => {
      const [startDate, startTime] = s.startUseTime.split('T');
      const [endDate, endTime] = s.endUseTime
        ? s.endUseTime.split('T')
        : ['N/A', 'N/A'];

      return {
        ID: s.id,
        Responsable: `${s.user.firstName} ${s.user.lastName}`,
        Correo: s.user.email,
        Identificación: s.user.identification,
        'Código de inventario': s.equipment.inventoryNumber,
        Equipo: s.equipment.equipmentName,
        Laboratorio: s.equipment.laboratory.laboratoryName,
        Ubicación: s.equipment.laboratory.location.locationName,
        'Fecha de inicio': startDate,
        'Hora de inicio': startTime,
        'Fecha de fin': endDate,
        'Hora de fin': endTime,
        'Tiempo de uso': this.getUsageDuration(s.startUseTime, s.endUseTime),
        'Sesión activa': s.isInUse ? 'Sí' : 'No',
        Verificado: s.isVerified ? 'Sí' : 'No',
        'Para uso': s.isAvailable ? 'Sí' : 'No',
        'Cantidad de muestras': s.samplesNumber ?? 0,
        'Funciones usadas': s.usedFunctions
          .map((f) => f.functionName)
          .join(', '),
        Observaciones: s.observations ?? '',
      };
    });*/
    return [];
  }

  private getUsageDuration(start: string, end: string | null): string {
    if (!start || !end) return 'En curso';

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();

    if (isNaN(diffMs) || diffMs < 0) return 'Inválido';

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number): string => n.toString().padStart(2, '0');

    if (days > 0) {
      return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  @ViewChild('pdfReportContent', { static: false })
  pdfReportContent!: ElementRef;

  exportToPDF(): void {
    const element = this.pdfReportContent.nativeElement;

    html2canvas(element, {
      scale: 2, // 🔍 Alta resolución
      scrollY: -window.scrollY,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 210;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `informe_sesiones_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, '-')}.pdf`;

      pdf.save(fileName);
    });
  }

  private processSessionDataFromSessionRecords(): void {
    let active = 0,
      finished = 0;
    let verified = 0,
      notVerified = 0;
    let available = 0,
      unavailable = 0;
    this.sessionStartDates = [];
    this.sampleRangeData = [0, 0, 0, 0, 0];

    const equipmentMap = new Map<string, number>();
    const labMap = new Map<string, number>();
    const inventoryCodeMap = new Map<string, number>();
    const hourMap = new Map<number, number>();
    const functionMap = new Map<string, number>();
    const userMap = new Map<string, number>();
    const dateCounts = new Map<string, number>();

    const incrementMap = <T>(map: Map<T, number>, key: T) => {
      map.set(key, (map.get(key) ?? 0) + 1);
    };

    const classifySampleRange = (count: number) => {
      if (count === 0) return 0;
      if (count <= 5) return 1;
      if (count <= 10) return 2;
      if (count <= 20) return 3;
      return 4;
    };

    for (const session of this.sessionRecords) {
      session.inProgress ? active++ : finished++;
      incrementMap(equipmentMap, session.equipment);
      incrementMap(labMap, session.labName ?? 'Desconocido');
      incrementMap(inventoryCodeMap, session.inventoryCode);

      const start = new Date(session.startDateTime);
      if (!isNaN(start.getTime())) {
        this.sessionStartDates.push(start);
        incrementMap(hourMap, start.getHours());
        incrementMap(dateCounts, start.toISOString().split('T')[0]);
      }

      session.verifiedStatus === 'SI' ? verified++ : notVerified++;
      session.usageStatus === 'SI' ? available++ : unavailable++;

      const sampleIndex = classifySampleRange(session.sampleCount ?? 0);
      this.sampleRangeData[sampleIndex]++;

      (session.functionsUsed ?? []).forEach((func) =>
        incrementMap(functionMap, func)
      );
      incrementMap(userMap, session.responsible);
    }

    // Set chart data arrays
    this.usageData = [finished, active];
    this.equipmentLabels = [...equipmentMap.keys()];
    this.equipmentData = [...equipmentMap.values()];
    this.laboratoryLabels = [...labMap.keys()];
    this.laboratoryData = [...labMap.values()];
    this.inventoryCodeLabels = [...inventoryCodeMap.keys()];
    this.inventoryCodeData = [...inventoryCodeMap.values()];

    const sortedHours = [...hourMap.keys()].sort((a, b) => a - b);
    this.sessionHourLabels = sortedHours.map(
      (h) => `${h.toString().padStart(2, '0')}:00`
    );
    this.sessionHourData = sortedHours.map((h) => hourMap.get(h)!);

    this.verifiedData = [verified, notVerified];
    this.usageStatusData = [available, unavailable];
    this.functionLabels = [...functionMap.keys()];
    this.functionData = [...functionMap.values()];
    this.userLabels = [...userMap.keys()];
    this.userData = [...userMap.values()];

    this.sessionStatusChartConfig = this.createPieChartConfig(
      ['Finalizadas', 'En progreso'],
      this.usageData,
      'Estado de las Sesiones'
    );

    this.equipmentUsageChartConfig = this.createBarChartConfig(
      this.equipmentLabels,
      this.equipmentData,
      'Sesiones por Equipo',
      'Equipo'
    );

    this.labUsageChartConfig = this.createBarChartConfig(
      this.laboratoryLabels,
      this.laboratoryData,
      'Sesiones por Laboratorio',
      'Laboratorio'
    );

    this.inventoryCodeUsageChartConfig = this.createBarChartConfig(
      this.inventoryCodeLabels,
      this.inventoryCodeData,
      'Sesiones por Código de Inventario',
      'Código'
    );

    const timelineLabels = [...dateCounts.keys()].sort();
    const timelineData = timelineLabels.map((label) => dateCounts.get(label)!);
    this.sessionTimelineChartConfig = this.createLineChartConfig(
      timelineLabels,
      timelineData,
      'Tendencia de Inicio de Sesiones',
      'Fecha',
      'Sesiones'
    );

    this.sessionsByHourChartConfig = this.createBarChartConfig(
      this.sessionHourLabels,
      this.sessionHourData,
      'Sesiones por Hora del Día',
      'Hora del Día'
    );

    this.verifiedStatusChartConfig = this.createPieChartConfig(
      ['Verificadas', 'No verificadas'],
      this.verifiedData,
      'Estado de Verificación'
    );

    this.usageStatusChartConfig = this.createPieChartConfig(
      ['Habilitados', 'No habilitados'],
      this.usageStatusData,
      'Estado de Disponibilidad para Uso'
    );

    this.samplesChartConfig = this.createBarChartConfig(
      this.sampleRangeLabels,
      this.sampleRangeData,
      'Cantidad de Muestras por Sesión',
      'Rango de Muestras'
    );

    this.functionUsageChartConfig = this.createBarChartConfig(
      this.functionLabels.length ? this.functionLabels : ['Sin datos'],
      this.functionData.length ? this.functionData : [0],
      'Funciones Más Utilizadas',
      'Función'
    );

    this.userUsageChartConfig = this.createBarChartConfig(
      this.userLabels.length ? this.userLabels : ['Sin datos'],
      this.userData.length ? this.userData : [0],
      'Sesiones por Responsable',
      'Responsable'
    );
  }

  private createLineChartConfig(
    labels: string[],
    data: number[],
    title: string,
    xAxisLabel: string,
    yAxisLabel: string
  ): any {
    const color = this.chartColors[0]; // Primer color
    return {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['Sin datos'],
        datasets: [
          {
            data: data.length ? data : [0],
            label: 'Sesiones',
            fill: false,
            tension: 0.3,
            borderColor: color,
            backgroundColor: color,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xAxisLabel,
              font: { size: 14, weight: 'bold' },
            },
            ticks: {
              autoSkip: true,
              maxRotation: 45,
              minRotation: 30,
            },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            title: {
              display: true,
              text: yAxisLabel,
              font: { size: 14, weight: 'bold' },
            },
          },
        },
      },
    };
  }

  private createBarChartConfig(
    labels: string[],
    data: number[],
    title: string,
    yAxisLabel: string
  ): any {
    const backgroundColors = labels.map(
      (_, i) => this.chartColors[i % this.chartColors.length]
    );
    return {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Sin datos'],
        datasets: [
          {
            data: data.length ? data : [0],
            label: 'Sesiones',
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          title: {
            display: true,
            text: title,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0 },
            title: {
              display: true,
              text: 'Cantidad de Sesiones',
            },
          },
          y: {
            title: {
              display: true,
              text: yAxisLabel,
            },
          },
        },
      },
    };
  }

  private createPieChartConfig(
    labels: string[],
    data: number[],
    title: string
  ): any {
    const backgroundColors = labels.map(
      (_, i) => this.chartColors[i % this.chartColors.length]
    );
    return {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
          },
        },
      },
    };
  }
}
