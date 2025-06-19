import {
  EquipmentUseFilterRequest,
  EquipmentUseResponse,
  EquipmentUseService,
} from './../../../../core/session/services/equipment-use.service';
import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchFilterOnlyComponent } from '../../../../shared/components/search-filter-only/search-filter-only.component';
import { FieldConfig } from '../../../../shared/model/field-config.model';
import { LaboratoryService } from '../../../../core/laboratory/services/laboratory.service';
import { EquipmentService } from '../../../../core/equipment/services/equipment.service';
import {
  FunctionDto,
  FunctionService,
} from '../../../../core/function/services/function.service';
import { UserRecordResponse } from '../../../../core/dto/user/record-user-response.dto';
import { UserService } from '../../../../core/services/user/user.service';
import { Laboratory } from '../../../../core/laboratory/models/laboratory.model';
import { EquipmentDto } from '../../../../core/equipment/models/equipment-response.dto';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    sessionStatus: '',
  };

  availableFilterKeys = [
    { key: 'user', label: 'Responsable' },
    { key: 'lab', label: 'Laboratorio' },
    { key: 'equipment', label: 'Equipo / Patrón' },
    { key: 'function', label: 'Función' },
    { key: 'sessionStatus', label: 'Estado de la sesión' },
    { key: 'verifiedStatus', label: 'Verificado' },
    { key: 'usageStatus', label: 'Para uso' },
    { key: 'dateFrom', label: 'Fecha desde' },
    { key: 'dateTo', label: 'Fecha hasta' },
    { key: 'timeFrom', label: 'Hora desde' },
    { key: 'timeTo', label: 'Hora hasta' },
    { key: 'sampleCountMin', label: 'Muestras desde' },
    { key: 'sampleCountMax', label: 'Muestras hasta' },
  ];

  activeFilterKeys: string[] = [];

  fieldsConfig: FieldConfig[] = [
    {
      key: 'user',
      label: 'Responsable',
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
      key: 'equipment',
      label: 'Equipo / Patrón',
      type: 'dropdown',
      allowEmptyOption: 'Todos',
    },
    {
      key: 'function',
      label: 'Función utilizada',
      type: 'dropdown',
      allowEmptyOption: 'Todas',
    },
    {
      key: 'sessionStatus',
      label: 'Estado de la sesión',
      type: 'select',
      options: ['En curso', 'Finalizada'],
      allowEmptyOption: 'Todas',
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
  ];

  activeTab:
    | 'estado'
    | 'historico'
    | 'hora'
    | 'laboratorio'
    | 'equipo'
    | 'funcion'
    | 'usuario'
    | 'verificado'
    | 'paraUso'
    | 'muestras' = 'usuario';

  availableLabs: string[] = [];
  availableEquipments: string[] = [];
  availableFunctions: string[] = [];
  availableUsers: string[] = [];

  labsFull: Laboratory[] = [];
  equipmentsFull: EquipmentDto[] = [];
  functionsFull: FunctionDto[] = [];
  usersFull: UserRecordResponse[] = [];
  sessionRecords: EquipmentUseResponse[] = [];

  sessionStartDates: Date[] = [];
  usageLabels = ['Finalizadas', 'En Progreso'];
  usageData = [0, 0];
  laboratoryLabels: string[] = [];
  laboratoryData: number[] = [];
  equipmentLabels: string[] = [];
  equipmentData: number[] = [];
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
  functionUsageChartConfig!: ChartConfiguration<'bar'>;
  samplesChartConfig!: ChartConfiguration<'bar'>;
  sessionsByHourChartConfig!: ChartConfiguration<'bar'>;
  sessionTimelineChartConfig!: ChartConfiguration<'line'>;
  sessionStatusChartConfig!: ChartConfiguration<'pie'>;
  verifiedStatusChartConfig!: ChartConfiguration<'pie'>;
  usageStatusChartConfig!: ChartConfiguration<'pie'>;

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

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.usersFull = users;
        this.availableUsers = users.map((u) => `${u.firstName} ${u.lastName}`);
      },
    });
  }

  onFiltersChange(updated: Partial<typeof this.filters>): void {
    this.filters = { ...this.filters, ...updated };
    this.onSearch();
  }

  onSearch(): void {
    const request: EquipmentUseFilterRequest = {
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
      userId: this.getUserIdByFullName(this.filters.user),
      laboratoryId: this.getLabIdByName(this.filters.lab),
    };

    this.isLoading = true;
    this.equipmentUseService.filter(request).subscribe({
      next: (response) => {
        this.sessionRecords = response ?? [];
        this.processSessionDataFromSessionRecords();
        this.isLoading = false;
      },
      error: () => {
        this.sessionRecords = [];
        this.isLoading = false;
      },
    });
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

  getUserIdByFullName(fullName: string): number | undefined {
    const [firstName, lastName] = fullName.trim().split(' ');
    return this.usersFull.find(
      (u) =>
        u.firstName.toLowerCase() === firstName?.toLowerCase() &&
        u.lastName.toLowerCase() === lastName?.toLowerCase()
    )?.id;
  }

  getFunctionIdByName(name: string): number[] | undefined {
    const fn = this.functionsFull.find(
      (f) => f.functionName.toLowerCase() === name.toLowerCase()
    );
    return fn ? [fn.id] : undefined;
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
      sessionStatus: '',
    };
    this.onSearch();
  }

  private processSessionDataFromSessionRecords(): void {
    let active = 0;
    let finished = 0;
    this.sessionStartDates = [];
    const labMap = new Map<string, number>();
    const equipmentMap = new Map<string, number>();
    const functionMap = new Map<string, number>();
    const hourMap = new Map<number, number>();
    const userMap = new Map<string, number>();
    let verified = 0;
    let notVerified = 0;
    let available = 0;
    let unavailable = 0;
    this.sampleRangeData = [0, 0, 0, 0, 0];

    for (const session of this.sessionRecords) {
      if (session.isInUse) active++;
      else finished++;

      const start = new Date(session.startUseTime);
      if (!isNaN(start.getTime())) {
        this.sessionStartDates.push(start);
        const hour = start.getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      }

      const lab =
        session.equipment?.laboratory?.laboratoryName ?? 'Desconocido';
      labMap.set(lab, (labMap.get(lab) || 0) + 1);

      const eq = session.equipment
        ? `${session.equipment.equipmentName} - ${session.equipment.inventoryNumber}`
        : 'Equipo desconocido';
      equipmentMap.set(eq, (equipmentMap.get(eq) || 0) + 1);

      for (const func of session.usedFunctions ?? []) {
        functionMap.set(
          func.functionName,
          (functionMap.get(func.functionName) || 0) + 1
        );
      }

      const responsible = session.user
        ? `${session.user.firstName} ${session.user.lastName}`
        : 'Desconocido';
      userMap.set(responsible, (userMap.get(responsible) || 0) + 1);

      if (session.isVerified) verified++;
      else notVerified++;

      if (session.isAvailable) available++;
      else unavailable++;

      const count = session.samplesNumber ?? 0;

      if (count === 0) this.sampleRangeData[0]++;
      else if (count <= 5) this.sampleRangeData[1]++;
      else if (count <= 10) this.sampleRangeData[2]++;
      else if (count <= 20) this.sampleRangeData[3]++;
      else this.sampleRangeData[4]++;
    }

    this.usageData = [finished, active];
    this.laboratoryLabels = [...labMap.keys()];
    this.laboratoryData = [...labMap.values()];
    this.equipmentLabels = [...equipmentMap.keys()];
    this.equipmentData = [...equipmentMap.values()];
    this.functionLabels = [...functionMap.keys()];
    this.functionData = [...functionMap.values()];
    this.sessionHourLabels = [...hourMap.keys()]
      .sort((a, b) => a - b)
      .map((h) => `${h.toString().padStart(2, '0')}:00`);
    this.sessionHourData = [...hourMap.keys()]
      .sort((a, b) => a - b)
      .map((h) => hourMap.get(h)!);
    this.userLabels = [...userMap.keys()];
    this.userData = [...userMap.values()];
    this.verifiedData = [verified, notVerified];
    this.usageStatusData = [available, unavailable];

    this.userUsageChartConfig = {
      type: 'bar',
      data: {
        labels: this.userLabels.length ? this.userLabels : ['Sin datos'],
        datasets: [
          {
            data: this.userData.length ? this.userData : [0],
            label: 'Sesiones',
            backgroundColor: '#dc3545',
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
            text: 'Frecuencia de Uso por Responsable',
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
              text: 'Responsables',
            },
          },
        },
      },
    };

    this.labUsageChartConfig = {
      type: 'bar',
      data: {
        labels: this.laboratoryLabels.length
          ? this.laboratoryLabels
          : ['Sin datos'],
        datasets: [
          {
            data: this.laboratoryData.length ? this.laboratoryData : [0],
            label: 'Sesiones',
            backgroundColor: '#28a745',
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
            text: 'Frecuencia de Uso por Laboratorio',
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0 },
            title: { display: true, text: 'Cantidad de Sesiones' },
          },
          y: {
            title: { display: true, text: 'Laboratorios' },
          },
        },
      },
    };

    this.equipmentUsageChartConfig = {
      type: 'bar',
      data: {
        labels: this.equipmentLabels.length
          ? this.equipmentLabels
          : ['Sin datos'],
        datasets: [
          {
            data: this.equipmentData.length ? this.equipmentData : [0],
            label: 'Sesiones',
            backgroundColor: '#ffc107',
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
            text: 'Frecuencia de Uso por Equipo',
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
              text: 'Equipos',
            },
          },
        },
      },
    };

    this.functionUsageChartConfig = {
      type: 'bar',
      data: {
        labels: this.functionLabels.length
          ? this.functionLabels
          : ['Sin datos'],
        datasets: [
          {
            data: this.functionData.length ? this.functionData : [0],
            label: 'Sesiones',
            backgroundColor: '#17a2b8',
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
            text: 'Frecuencia de Uso por Función',
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
              text: 'Funciones Utilizadas',
            },
          },
        },
      },
    };

    this.samplesChartConfig = {
      type: 'bar',
      data: {
        labels: this.sampleRangeLabels,
        datasets: [
          {
            data: this.sampleRangeData,
            label: 'Sesiones',
            backgroundColor: '#20c997',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución por Cantidad de Muestras',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Rango de Muestras',
            },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            title: {
              display: true,
              text: 'Cantidad de Sesiones',
            },
          },
        },
      },
    };

    this.sessionsByHourChartConfig = {
      type: 'bar',
      data: {
        labels: this.sessionHourLabels.length
          ? this.sessionHourLabels
          : ['Sin datos'],
        datasets: [
          {
            data: this.sessionHourData.length ? this.sessionHourData : [0],
            label: 'Sesiones',
            backgroundColor: '#6f42c1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Sesiones por Hora del Día',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hora',
            },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            title: {
              display: true,
              text: 'Cantidad de Sesiones',
            },
          },
        },
      },
    };

    const dateCounts = new Map<string, number>();
    for (const date of this.sessionStartDates) {
      const formatted = date.toISOString().split('T')[0];
      dateCounts.set(formatted, (dateCounts.get(formatted) || 0) + 1);
    }

    const timelineLabels = Array.from(dateCounts.keys()).sort();
    const timelineData = timelineLabels.map((label) => dateCounts.get(label)!);

    this.sessionTimelineChartConfig = {
      type: 'line',
      data: {
        labels: timelineLabels.length ? timelineLabels : ['Sin datos'],
        datasets: [
          {
            data: timelineData.length ? timelineData : [0],
            label: 'Sesiones',
            fill: false,
            tension: 0.3,
            borderColor: '#007bff',
            backgroundColor: '#007bff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Histórico de Inicio de Sesiones',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Fecha de Inicio',
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
              text: 'Cantidad de Sesiones',
              font: { size: 14, weight: 'bold' },
            },
          },
        },
      },
    };

    this.sessionStatusChartConfig = {
      type: 'pie',
      data: {
        labels: ['Finalizadas', 'En Progreso'],
        datasets: [
          {
            data: this.usageData,
            backgroundColor: ['#20c997', '#ffc107'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Estado de la Sesión',
          },
        },
      },
    };

    this.verifiedStatusChartConfig = {
      type: 'pie',
      data: {
        labels: ['SI', 'NO'],
        datasets: [
          {
            data: this.verifiedData,
            backgroundColor: ['#0d6efd', '#adb5bd'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Estado Verificado',
          },
        },
      },
    };

    this.usageStatusChartConfig = {
      type: 'pie',
      data: {
        labels: ['SI', 'NO'],
        datasets: [
          {
            data: this.usageStatusData,
            backgroundColor: ['#20c997', '#adb5bd'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Estado Para Uso',
          },
        },
      },
    };
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
    const data = this.mapSessionRecordsToExport();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const fileName = `reporte_sesiones_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, '-')}.csv`;

    saveAs(blob, fileName);
  }

  private mapSessionRecordsToExport(): any[] {
    return this.sessionRecords.map((s) => {
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
    });
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
}
