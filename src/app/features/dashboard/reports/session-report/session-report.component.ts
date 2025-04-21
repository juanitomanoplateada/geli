import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DropdownFilterComponent } from '../../../../shared/components/dropdown-filter/dropdown-filter.component';

(jsPDF as any).autoTable = autoTable;

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
  selector: 'app-session-report',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, DropdownFilterComponent],
  templateUrl: './session-report.component.html',
  styleUrls: ['./session-report.component.scss'],
})
export class SessionReportComponent implements OnInit {
  allSessions: SessionRecord[] = []; // ← todas las sesiones cargadas
  filteredSessions: SessionRecord[] = [];

  // Estado visual
  isBrowser: boolean = false;
  activeTab: string = 'verified';

  // Filtros
  filters = {
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    lab: '',
    equipment: '',
    verifiedStatus: '',
    usageStatus: '',
    usageDurationMin: null as number | null,
    usageDurationMax: null as number | null,
    sampleCountMin: null as number | null,
    sampleCountMax: null as number | null,
    function: '',
    user: '',
  };

  // Opciones disponibles
  labOptions: string[] = [];
  equipmentOptions: string[] = [];
  responsibleOptions: string[] = [];

  filteredFunctions: string[] = [];

  // Datos para gráficas
  verifiedChart!: ChartData;
  usageChart!: ChartData;
  samplesChart!: ChartData;
  functionsChart!: ChartData;
  labChart!: ChartData;
  equipmentChart!: ChartData;
  dateChart!: ChartData;
  timeChart!: ChartData;
  usageStatusChart!: ChartData;
  responsibleChart!: ChartData;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.allSessions = [
      {
        id: 1,
        lab: 'Laboratorio de DRX',
        equipment: 'Espectrómetro X200',
        date: '2025-04-01',
        time: '09:00',
        verifiedStatus: 'SI',
        responsible: 'Ana Pérez',
        email: 'ana.perez@incitema.edu.co',
        usageStatus: 'Disponible',
        usageDuration: 45,
        sampleCount: 10,
        functionsUsed: ['Calibración', 'Medición'],
        observations: 'Funcionamiento normal.',
      },
      {
        id: 2,
        lab: 'Laboratorio de Metalografía',
        equipment: 'Microscopio MX100',
        date: '2025-04-03',
        time: '14:30',
        verifiedStatus: 'NO',
        responsible: 'Carlos Gómez',
        email: 'carlos.gomez@incitema.edu.co',
        usageStatus: 'No disponible',
        usageDuration: 60,
        sampleCount: 5,
        functionsUsed: ['Inspección'],
        observations: 'Lente dañado.',
      },
      {
        id: 3,
        lab: 'Laboratorio de DRX',
        equipment: 'Espectrómetro X200',
        date: '2025-04-05',
        time: '10:15',
        verifiedStatus: 'SI',
        responsible: 'Laura Díaz',
        email: 'laura.diaz@incitema.edu.co',
        usageStatus: 'Disponible',
        usageDuration: 30,
        sampleCount: 7,
        functionsUsed: ['Medición'],
        observations: '',
      },
      {
        id: 4,
        lab: 'Laboratorio de Corrosión',
        equipment: 'Cámara de niebla salina CS500',
        date: '2025-04-07',
        time: '08:00',
        verifiedStatus: 'SI',
        responsible: 'Julián Ramírez',
        email: 'julian.ramirez@incitema.edu.co',
        usageStatus: 'Disponible',
        usageDuration: 120,
        sampleCount: 12,
        functionsUsed: ['Ensayo acelerado'],
        observations: 'Se generaron buenos resultados.',
      },
      {
        id: 5,
        lab: 'Laboratorio de Metalografía',
        equipment: 'Pulidora automática PL300',
        date: '2025-04-08',
        time: '11:45',
        verifiedStatus: 'NO',
        responsible: 'Sofía Martínez',
        email: 'sofia.martinez@incitema.edu.co',
        usageStatus: 'No disponible',
        usageDuration: 25,
        sampleCount: 3,
        functionsUsed: ['Pulido'],
        observations: 'Ruido excesivo durante operación.',
      },
    ];
    this.filteredSessions = [...this.allSessions];

    this.labOptions = [...new Set(this.allSessions.map((s) => s.lab))];
    this.equipmentOptions = [
      ...new Set(this.allSessions.map((s) => s.equipment)),
    ];
    this.responsibleOptions = [
      ...new Set(this.allSessions.map((s) => s.responsible)),
    ];

    this.filteredFunctions = this.extractFunctions();

    this.generateCharts();
  }

  onLabChange(selected: string): void {
    this.filters.lab = selected;
    this.filterSessions();
  }

  onEquipmentChange(selected: string): void {
    this.filters.equipment = selected;
    this.filterSessions();
  }

  onUserChange(selected: string): void {
    this.filters.user = selected;
    this.filterSessions();
  }

  onFunctionChange(selected: string): void {
    this.filters.function = selected;
    this.filterSessions();
  }

  extractFunctions(): string[] {
    const all = this.allSessions.flatMap((s) => s.functionsUsed || []);
    return [...new Set(all)];
  }

  filterSessions() {
    this.filteredSessions = this.allSessions.filter((s) => {
      const f = this.filters;
      return (
        (!f.lab || s.lab === f.lab) &&
        (!f.equipment || s.equipment === f.equipment) &&
        (!f.verifiedStatus || s.verifiedStatus === f.verifiedStatus) &&
        (!f.usageStatus || s.usageStatus === f.usageStatus) &&
        (!f.user || s.responsible === f.user) &&
        (!f.function || s.functionsUsed?.includes(f.function)) &&
        (!f.dateFrom || s.date >= f.dateFrom) &&
        (!f.dateTo || s.date <= f.dateTo) &&
        (!f.timeFrom || s.time >= f.timeFrom) &&
        (!f.timeTo || s.time <= f.timeTo) &&
        (f.usageDurationMin == null ||
          (s.usageDuration ?? 0) >= f.usageDurationMin) &&
        (f.usageDurationMax == null ||
          (s.usageDuration ?? 0) <= f.usageDurationMax) &&
        (f.sampleCountMin == null ||
          (s.sampleCount ?? 0) >= f.sampleCountMin) &&
        (f.sampleCountMax == null || (s.sampleCount ?? 0) <= f.sampleCountMax)
      );
    });

    this.generateCharts();
  }

  resetFilters() {
    this.filters = {
      dateFrom: '',
      dateTo: '',
      timeFrom: '',
      timeTo: '',
      lab: '',
      equipment: '',
      verifiedStatus: '',
      usageStatus: '',
      usageDurationMin: null,
      usageDurationMax: null,
      sampleCountMin: null,
      sampleCountMax: null,
      function: '',
      user: '',
    };

    this.filterSessions();
  }

  generateCharts() {
    const countBy = <T>(arr: T[]) =>
      arr.reduce((acc: any, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});

    const verifiedStats = countBy(
      this.filteredSessions.map((s) => s.verifiedStatus)
    );
    const usageStats = countBy(this.filteredSessions.map((s) => s.usageStatus));
    const sampleData = this.filteredSessions.map((s) => s.sampleCount ?? 0);
    const usageData = this.filteredSessions.map((s) => s.usageDuration ?? 0);
    const functionStats = countBy(
      this.filteredSessions.flatMap((s) => s.functionsUsed || [])
    );

    this.verifiedChart = {
      labels: Object.keys(verifiedStats),
      datasets: [{ data: Object.values(verifiedStats) }],
    };

    this.usageChart = {
      labels: this.filteredSessions.map((_, i) => `Sesión ${i + 1}`),
      datasets: [{ label: 'Minutos', data: usageData }],
    };

    this.samplesChart = {
      labels: this.filteredSessions.map((_, i) => `Sesión ${i + 1}`),
      datasets: [{ label: 'Muestras', data: sampleData }],
    };

    this.functionsChart = {
      labels: Object.keys(functionStats),
      datasets: [{ label: 'Frecuencia', data: Object.values(functionStats) }],
    };

    const labStats = countBy(this.filteredSessions.map((s) => s.lab));
    const equipmentStats = countBy(
      this.filteredSessions.map((s) => s.equipment)
    );
    const dateStats = countBy(this.filteredSessions.map((s) => s.date));
    const timeStats = countBy(this.filteredSessions.map((s) => s.time));
    const usageStatusStats = countBy(
      this.filteredSessions.map((s) => s.usageStatus)
    );
    const responsibleStats = countBy(
      this.filteredSessions.map((s) => s.responsible)
    );

    this.labChart = {
      labels: Object.keys(labStats),
      datasets: [{ label: 'Laboratorios', data: Object.values(labStats) }],
    };

    this.equipmentChart = {
      labels: Object.keys(equipmentStats),
      datasets: [{ label: 'Equipos', data: Object.values(equipmentStats) }],
    };

    this.dateChart = {
      labels: Object.keys(dateStats),
      datasets: [
        { label: 'Sesiones por fecha', data: Object.values(dateStats) },
      ],
    };

    this.timeChart = {
      labels: Object.keys(timeStats),
      datasets: [
        { label: 'Sesiones por hora', data: Object.values(timeStats) },
      ],
    };

    this.usageStatusChart = {
      labels: Object.keys(usageStatusStats),
      datasets: [
        { label: 'Estado para uso', data: Object.values(usageStatusStats) },
      ],
    };

    this.responsibleChart = {
      labels: Object.keys(responsibleStats),
      datasets: [
        { label: 'Responsables', data: Object.values(responsibleStats) },
      ],
    };
  }

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.filteredSessions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `reporte_sesiones_${Date.now()}.xlsx`);
  }

  exportToCSV() {
    const header = Object.keys(this.filteredSessions[0] || {}).join(',');
    const rows = this.filteredSessions.map((s) =>
      Object.values(s)
        .map((v) => `"${Array.isArray(v) ? v.join(';') : v}"`)
        .join(',')
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `reporte_sesiones_${Date.now()}.csv`);
  }

  exportToPDF() {
    const doc = new jsPDF();
    const headers = [
      [
        'ID',
        'Lab',
        'Equipo',
        'Fecha',
        'Hora',
        'Verificado',
        'Responsable',
        'Correo',
        'Estado',
        'Min',
        'Muestras',
        'Funciones',
        'Observaciones',
      ],
    ];
    const body = this.filteredSessions.map((s) => [
      s.id,
      s.lab,
      s.equipment,
      s.date,
      s.time,
      s.verifiedStatus,
      s.responsible,
      s.email,
      s.usageStatus,
      s.usageDuration,
      s.sampleCount,
      (s.functionsUsed || []).join(', '),
      s.observations,
    ]);
    (doc as any).autoTable({ head: headers, body });
    doc.save(`reporte_sesiones_${Date.now()}.pdf`);
  }
}
