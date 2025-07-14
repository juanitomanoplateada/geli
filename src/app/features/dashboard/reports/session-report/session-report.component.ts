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
import JSZip from 'jszip';

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

  pdfCooldown = false;
  excelCooldown = false;
  csvCooldown = false;

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
    this.isLoading = true;

    this.equipmentUseService.filter(request, 0, 999999).subscribe({
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
      brand: session.equipment.brand.brandName,
      lab: `${session.equipment.laboratory.laboratoryName}`,
      labName: session.equipment.laboratory.laboratoryName,
      inventoryCode: session.equipment.inventoryNumber,
      date: this.formatDate(session.startUseTime),
      time: this.formatTime(session.startUseTime),
      verifiedStatus:
        session.isVerified == null ? '—' : session.isVerified ? 'SI' : 'NO',

      usageStatus:
        session.isAvailable == null ? '—' : session.isAvailable ? 'SI' : 'NO',

      usageDuration: inProgress ? 'EN CURSO' : usageDuration,
      sampleCount: inProgress ? undefined : session.samplesNumber,
      functionsUsed: inProgress
        ? undefined
        : session.usedFunctions?.map((f) => f.functionName),
      observations: inProgress ? undefined : session.observations,
      responsible: `${session.user.firstName} ${session.user.lastName}`,
      email: session.user.email,
      inProgress,
      startDateTime: session.startUseTime,
      endUseTime: session.endUseTime ?? '',
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
    if (this.excelCooldown) return;
    this.excelCooldown = true;

    const data = this.mapSessionRecordsToExport();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sesiones');

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const zip = new JSZip();
    zip.file('reporte_sesiones.xlsx', excelBuffer);
    zip.file('filtros_aplicados.txt', this.buildFilterText());

    const fileName = this.generateFileName('zip');
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      saveAs(blob, fileName);
      setTimeout(() => (this.excelCooldown = false), 3000);
    });
  }

  exportToCSV(): void {
    if (this.csvCooldown) return;
    this.csvCooldown = true;

    const data = this.mapSessionRecordsToExport();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const zip = new JSZip();
    zip.file('reporte_sesiones.csv', csv);
    zip.file('filtros_aplicados.txt', this.buildFilterText());

    const fileName = this.generateFileName('zip');
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      saveAs(blob, fileName);
      setTimeout(() => (this.csvCooldown = false), 3000);
    });
  }

  private buildFilterText(): string {
    const lines: string[] = [];
    lines.push('🧾 Filtros aplicados');
    lines.push('======================');

    const keyLabels: Record<keyof typeof this.filters, string> = {
      sessionStatus: 'Estado de la sesión',
      equipment: 'Nombre del equipo/patrón',
      lab: 'Ubicación',
      codeInventory: 'Código de inventario',
      dateFrom: 'Fecha desde',
      dateTo: 'Fecha hasta',
      timeFrom: 'Hora desde',
      timeTo: 'Hora hasta',
      verifiedStatus: 'Estado - Verificado',
      usageStatus: 'Estado - Para uso',
      usageDurationMin: 'Duración mínima de uso (segundos)',
      usageDurationMax: 'Duración máxima de uso (segundos)',
      sampleCountMin: 'Cantidad de muestras analizadas desde',
      sampleCountMax: 'Cantidad de muestras analizadas hasta',
      function: 'Función utilizada',
      user: 'Nombre de quien usa el equipo/patrón',
    };

    for (const key in this.filters) {
      const typedKey = key as keyof typeof this.filters;
      const value = this.filters[typedKey];

      if (value !== null && value !== undefined && value !== '') {
        const label = keyLabels[typedKey] || key;
        lines.push(
          `${label}: ${Array.isArray(value) ? value.join(', ') : value}`
        );
      }
    }

    return lines.join('\n');
  }

  private generateFileName(extension: string): string {
    const now = new Date();
    const bogotaTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/Bogota' })
    );
    const yyyy = bogotaTime.getFullYear();
    const MM = String(bogotaTime.getMonth() + 1).padStart(2, '0');
    const dd = String(bogotaTime.getDate()).padStart(2, '0');
    const hh = String(bogotaTime.getHours()).padStart(2, '0');
    const mm = String(bogotaTime.getMinutes()).padStart(2, '0');
    const ss = String(bogotaTime.getSeconds()).padStart(2, '0');

    return `reporte_sesiones_${yyyy}-${MM}-${dd}_${hh}-${mm}-${ss}.${extension}`;
  }

  private mapSessionRecordsToExport(): any[] {
    return this.sessionRecords.map((s) => {
      const start = new Date(s.startDateTime);
      const end = s.endUseTime ? new Date(s.endUseTime) : null;

      const bogotaStart = new Date(
        start.toLocaleString('en-US', { timeZone: 'America/Bogota' })
      );

      const MM = bogotaStart.getMonth() + 1;
      const dd = bogotaStart.getDate();
      const yyyy = bogotaStart.getFullYear();

      const hh = String(bogotaStart.getHours()).padStart(2, '0');
      const mm = String(bogotaStart.getMinutes()).padStart(2, '0');
      const ss = String(bogotaStart.getSeconds()).padStart(2, '0');

      const marcaTemporal = `${MM}/${dd}/${yyyy} ${hh}:${mm}:${ss}`;
      const fecha = `${dd}/${MM}/${yyyy}`;

      const hora = bogotaStart.toLocaleTimeString('es-CO', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const nombreEquipo =
        `${s.equipment} ${s.brand} Código inventario: ${s.inventoryCode}`.toUpperCase();

      // 🧮 Duración
      let duracion = 'EN CURSO';
      if (end) {
        const diffMs = end.getTime() - start.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        duracion = `${hours}:${String(minutes).padStart(2, '0')}:${String(
          seconds
        ).padStart(2, '0')}`;
      }

      // 🧪 Funciones usadas
      const funciones = Array.isArray(s.functionsUsed)
        ? s.functionsUsed.join(', ')
        : '—';

      return {
        'Marca temporal': marcaTemporal,
        'Dirección de correo electrónico': s.email?.toUpperCase() || '',
        'Nombre del equipo': nombreEquipo,
        Fecha: fecha,
        Hora: hora,
        'Estado - Verificado': s.verifiedStatus || '',
        'Estado - Para uso': s.usageStatus || '',
        'Condiciones de uso - Tiempo de uso': duracion,
        'Condiciones de uso - Cantidad de muestras analizadas':
          s.sampleCount ?? '—',
        'Condiciones de uso - Funciones utilizadas': funciones,
        'Condiciones de uso - Observaciones':
          s.observations?.toUpperCase() || '',
        'Nombre de quien usa el equipo': s.responsible?.toUpperCase() || '',
      };
    });
  }

  @ViewChild('pdfReportContent', { static: false })
  pdfReportContent!: ElementRef;

  exportToPDF(): void {
    if (this.pdfCooldown || !this.pdfReportContent) return;

    this.pdfCooldown = true;

    const element = this.pdfReportContent.nativeElement;

    html2canvas(element, {
      scale: 2,
      scrollY: -window.scrollY,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 210;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // 🎯 Mapa de nombres bonitos
      const tabTitles: Record<string, string> = {
        estado: 'estado_sesion',
        equipo: 'por_equipo',
        laboratorio: 'por_laboratorio',
        codigo: 'por_codigo_inventario',
        historico: 'historico_por_fecha',
        hora: 'por_hora',
        verificado: 'estado_verificacion',
        paraUso: 'estado_disponibilidad',
        muestras: 'muestras_por_sesion',
        funcion: 'funciones_utilizadas',
        usuario: 'por_responsable',
      };

      const tabName = tabTitles[this.activeTab] || 'reporte_general';

      // 🕐 Fecha y hora Bogotá
      const now = new Date();
      const bogotaTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/Bogota' })
      );
      const yyyy = bogotaTime.getFullYear();
      const MM = String(bogotaTime.getMonth() + 1).padStart(2, '0');
      const dd = String(bogotaTime.getDate()).padStart(2, '0');
      const hh = String(bogotaTime.getHours()).padStart(2, '0');
      const mm = String(bogotaTime.getMinutes()).padStart(2, '0');
      const ss = String(bogotaTime.getSeconds()).padStart(2, '0');

      const fileName = `reporte_sesiones_${tabName}_${yyyy}-${MM}-${dd}_${hh}-${mm}-${ss}.pdf`;

      pdf.save(fileName);

      setTimeout(() => {
        this.pdfCooldown = false;
      }, 3000);
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

      if (session.verifiedStatus === 'SI') {
        verified++;
      } else if (session.verifiedStatus === 'NO') {
        notVerified++;
      }

      if (session.usageStatus === 'SI') {
        available++;
      } else if (session.usageStatus === 'NO') {
        unavailable++;
      }

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
