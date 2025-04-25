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
import { Chart, ChartData } from 'chart.js';
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

  generateFileName(extension: string): string {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10);
    const timePart = `${now.getHours()}-${now.getMinutes()}`;
    return `reporte_sesiones_${datePart}_${timePart}.${extension}`;
  }

  mapSessionsForExport(): any[] {
    return this.filteredSessions.map((s) => ({
      ID: s.id,
      Laboratorio: s.lab,
      Equipo: s.equipment,
      Fecha: s.date,
      Hora: s.time,
      Responsable: s.responsible,
      Correo: s.email,
      Verificado: s.verifiedStatus,
      'Estado para uso': s.usageStatus,
      'Funciones utilizadas': (s.functionsUsed || []).join(', '),
      'Minutos de uso': s.usageDuration ?? '',
      'Cantidad de muestras': s.sampleCount ?? '',
      Observaciones: s.observations || '',
    }));
  }

  exportToExcel(): void {
    const fileName = this.generateFileName('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(this.mapSessionsForExport());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sesiones');
    XLSX.writeFile(workbook, fileName);
  }

  exportToCSV(): void {
    const fileName = this.generateFileName('csv');
    const worksheet = XLSX.utils.json_to_sheet(this.mapSessionsForExport());
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, fileName);
  }

  async exportToPDF(): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin;

    doc.setFontSize(18);
    doc.text('Reporte de Sesiones de Uso de Equipos', pageWidth / 2, y, {
      align: 'center',
    });

    y += 10;
    doc.setFontSize(10);
    doc.text(
      `Generado: ${new Date().toLocaleString()}`,
      pageWidth - margin,
      y,
      {
        align: 'right',
      }
    );

    y += 15;
    doc.setFontSize(12);
    doc.text('Filtros Aplicados:', margin, y);

    const filters = [
      `• Laboratorio: ${this.filters.lab || 'Todos'}`,
      `• Equipo: ${this.filters.equipment || 'Todos'}`,
      `• Estado verificado: ${this.filters.verifiedStatus || 'Todos'}`,
      `• Estado de uso: ${this.filters.usageStatus || 'Todos'}`,
      `• Responsable: ${this.filters.user || 'Todos'}`,
      `• Función: ${this.filters.function || 'Todas'}`,
      `• Fecha: ${this.filters.dateFrom || 'N/A'} - ${
        this.filters.dateTo || 'N/A'
      }`,
      `• Hora: ${this.filters.timeFrom || 'N/A'} - ${
        this.filters.timeTo || 'N/A'
      }`,
      `• Minutos de uso: ${this.filters.usageDurationMin ?? 'Min'} - ${
        this.filters.usageDurationMax ?? 'Max'
      }`,
      `• Muestras: ${this.filters.sampleCountMin ?? 'Min'} - ${
        this.filters.sampleCountMax ?? 'Max'
      }`,
    ];

    filters.forEach((f) => doc.text(f, margin, (y += 6)));

    y += 10;
    doc.text('Lista de Sesiones:', margin, (y += 3));
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [
        [
          'ID',
          'Laboratorio',
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
      ],
      body: this.mapSessionsForExport().map((s) => Object.values(s)),
      margin: { left: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      didDrawPage: (data) => {
        if (data?.cursor?.y) y = data.cursor.y + 10;
      },
    });

    const chartRefs: {
      data: ChartData;
      type: 'bar' | 'line' | 'pie';
      title: string;
    }[] = [
      { data: this.verifiedChart, type: 'pie', title: 'Estado Verificado' },
      {
        data: this.usageChart,
        type: 'bar',
        title: 'Minutos de Uso por Sesión',
      },
      { data: this.samplesChart, type: 'bar', title: 'Muestras por Sesión' },
      { data: this.functionsChart, type: 'bar', title: 'Funciones Utilizadas' },
      { data: this.labChart, type: 'pie', title: 'Laboratorios Usados' },
      {
        data: this.equipmentChart,
        type: 'bar',
        title: 'Distribución por Equipos',
      },
      { data: this.dateChart, type: 'line', title: 'Sesiones por Fecha' },
      { data: this.timeChart, type: 'bar', title: 'Sesiones por Hora' },
      { data: this.usageStatusChart, type: 'pie', title: 'Estado para Uso' },
      {
        data: this.responsibleChart,
        type: 'bar',
        title: 'Sesiones por Responsable',
      },
    ];

    for (const chart of chartRefs) {
      const img = await this.renderHighResChart(chart.data, chart.type);
      doc.addPage();
      doc.setFontSize(14);
      doc.text(chart.title, margin, margin);
      doc.addImage(img, 'PNG', margin, margin + 5, pageWidth - margin * 2, 110);

      // Leyenda
      const labels = chart.data.labels ?? [];
      const values = chart.data.datasets?.[0]?.data ?? [];
      let yCursor = margin + 120;
      doc.setFontSize(11);
      doc.text('Detalle de datos:', margin, yCursor);
      labels.forEach((label, i) => {
        const value = values[i];
        if (label !== undefined && value !== undefined) {
          yCursor += 6;
          doc.text(`• ${label}: ${value}`, margin, yCursor);
        }
      });
    }

    doc.save(this.generateFileName('pdf'));
  }

  async renderHighResChart(
    chartData: ChartData,
    type: 'bar' | 'line' | 'pie',
    width = 1200,
    height = 800
  ): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');

      const chart = new Chart(ctx, {
        type,
        data: chartData,
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: { labels: { font: { size: 20 } } },
          },
          scales:
            type !== 'pie'
              ? {
                  x: { ticks: { font: { size: 18 } } },
                  y: { ticks: { font: { size: 18 } } },
                }
              : undefined,
        },
      });

      setTimeout(() => {
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#111';
        ctx.textAlign = 'center';

        const meta = chart.getDatasetMeta(0);
        const dataset = chart.data.datasets[0];

        if (type === 'bar' || type === 'line') {
          meta.data.forEach((element: any, i: number) => {
            const value = dataset.data?.[i];
            if (value !== undefined)
              ctx.fillText(String(value), element.x, element.y - 10);
          });
        }

        if (type === 'pie') {
          const rawData = dataset.data as number[];
          const total = rawData.reduce((a, b) => a + b, 0);
          meta.data.forEach((arc: any, i: number) => {
            const value = rawData[i];
            const angle = (arc.startAngle + arc.endAngle) / 2;
            const radius = arc.outerRadius * 0.75;
            const x = arc.x + Math.cos(angle) * radius;
            const y = arc.y + Math.sin(angle) * radius;
            const percentage = Math.round((value / total) * 100);
            ctx.fillText(`${percentage}%`, x, y);
          });
        }

        const img = canvas.toDataURL('image/png');
        chart.destroy();
        resolve(img);
      }, 500);
    });
  }
}
