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

@Component({
  selector: 'app-laboratory-report',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, DropdownFilterComponent],
  templateUrl: './laboratory-report.component.html',
  styleUrls: ['./laboratory-report.component.scss'],
})
export class LaboratoryReportComponent implements OnInit {
  activeTab: string = 'availability';
  isBrowser = false;

  @ViewChild('availabilityChartCanvas')
  availabilityChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('equipmentChartCanvas')
  equipmentChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('locationChartCanvas')
  locationChartCanvas!: ElementRef<HTMLCanvasElement>;

  laboratories = [
    {
      id: 1,
      name: 'Laboratorio de Física',
      description: 'Ensayos de materiales sólidos',
      availability: 'Disponible',
      location: { building: 'A', floor: '2' },
      equipment: ['Microscopio', 'Balanza'],
    },
    {
      id: 2,
      name: 'Laboratorio de Electrónica',
      description: 'Diseño de circuitos electrónicos',
      availability: 'Ocupado',
      location: { building: 'B', floor: '1' },
      equipment: ['Osciloscopio', 'Fuente DC', 'Protoboard'],
    },
    {
      id: 3,
      name: 'Laboratorio de Química',
      description: 'Procesos químicos básicos',
      availability: 'Disponible',
      location: { building: 'C', floor: '3' },
      equipment: ['PHmetro'],
    },
  ];

  availabilityOptions = ['Disponible', 'Ocupado'];
  locationOptions = [
    ...new Set(
      this.laboratories.map(
        (lab) => `${lab.location.building} - Piso ${lab.location.floor}`
      )
    ),
  ];

  selectedAvailability = '';
  selectedLocation = '';
  minEquipmentCount: number | null = null;
  maxEquipmentCount: number | null = null;

  filteredLaboratories = [...this.laboratories];

  availabilityChart: ChartData<'pie'> = { labels: [], datasets: [] };
  equipmentChart: ChartData<'bar'> = { labels: [], datasets: [] };
  locationChart: ChartData<'pie'> = { labels: [], datasets: [] };

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.updateCharts();
  }

  onLocationChange(location: string): void {
    this.selectedLocation = location;
    this.filterLaboratories();
  }

  filterLaboratories(): void {
    this.filteredLaboratories = this.laboratories.filter((lab) => {
      const availabilityMatch =
        !this.selectedAvailability ||
        lab.availability === this.selectedAvailability;
      const locationMatch =
        !this.selectedLocation ||
        `${lab.location.building} - Piso ${lab.location.floor}` ===
          this.selectedLocation;
      const minMatch =
        this.minEquipmentCount === null ||
        lab.equipment.length >= this.minEquipmentCount;
      const maxMatch =
        this.maxEquipmentCount === null ||
        lab.equipment.length <= this.maxEquipmentCount;
      return availabilityMatch && locationMatch && minMatch && maxMatch;
    });
    this.updateCharts();
  }

  resetFilters(): void {
    this.selectedAvailability = '';
    this.selectedLocation = '';
    this.minEquipmentCount = null;
    this.maxEquipmentCount = null;
    this.filteredLaboratories = [...this.laboratories];
    this.updateCharts();
  }

  updateCharts(): void {
    this.availabilityChart = this.buildPieChart(
      this.availabilityOptions,
      'availability'
    );
    this.equipmentChart = {
      labels: this.filteredLaboratories.map((lab) => lab.name),
      datasets: [
        {
          label: 'Cantidad de Equipos',
          data: this.filteredLaboratories.map((lab) => lab.equipment.length),
        },
      ],
    };
    this.locationChart = this.buildPieChart(this.locationOptions, 'location');
  }

  buildPieChart<T extends 'pie'>(
    labels: string[],
    field: 'availability' | 'location'
  ): ChartData<T> {
    const data = labels.map(
      (label) =>
        this.filteredLaboratories.filter((lab) => {
          if (field === 'availability') return lab.availability === label;
          if (field === 'location')
            return (
              `${lab.location.building} - Piso ${lab.location.floor}` === label
            );
          return false;
        }).length
    );
    return { labels, datasets: [{ data }] } as ChartData<T>;
  }

  getChartValue(chart: ChartData, index: number): number {
    return chart.datasets?.[0] && 'data' in chart.datasets[0]
      ? (chart.datasets[0].data as number[])[index] ?? 0
      : 0;
  }

  exportToExcel(): void {
    const fileName = this.generateFileName('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(
      this.filteredLaboratories.map((lab) => ({
        ID: lab.id,
        Nombre: lab.name,
        Descripción: lab.description,
        Disponibilidad: lab.availability,
        Ubicación: `${lab.location.building} - Piso ${lab.location.floor}`,
        'Cantidad de Equipos': lab.equipment.length,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laboratorios');
    XLSX.writeFile(workbook, fileName);
  }

  exportToCSV(): void {
    const fileName = this.generateFileName('csv');
    const worksheet = XLSX.utils.json_to_sheet(
      this.filteredLaboratories.map((lab) => ({
        ID: lab.id,
        Nombre: lab.name,
        Descripción: lab.description,
        Disponibilidad: lab.availability,
        Ubicación: `${lab.location.building} - Piso ${lab.location.floor}`,
        'Cantidad de Equipos': lab.equipment.length,
      }))
    );
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), fileName);
  }

  async exportToPDF(): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    doc.setFontSize(18);
    doc.text('Reporte de Laboratorios', pageWidth / 2, y, { align: 'center' });

    y += 10;
    doc.setFontSize(10);
    doc.text(
      `Generado: ${new Date().toLocaleString()}`,
      pageWidth - margin,
      y,
      { align: 'right' }
    );

    y += 15;
    doc.setFontSize(12);
    doc.text('Filtros Aplicados:', margin, y);
    y += 8;

    const filtros = [
      `• Disponibilidad: ${this.selectedAvailability || 'Todas'}`,
      `• Ubicación: ${this.selectedLocation || 'Todas'}`,
      `• Cantidad de Equipos desde: ${this.minEquipmentCount ?? 'Sin mínimo'}`,
      `• Cantidad de Equipos hasta: ${this.maxEquipmentCount ?? 'Sin máximo'}`,
    ];

    filtros.forEach((f) => {
      doc.text(f, margin, y);
      y += 6;
    });

    y += 10;
    doc.text('Resumen:', margin, y);
    y += 8;
    doc.text(
      `• Disponible: ${this.getChartValue(this.availabilityChart, 0)}`,
      margin,
      y
    );
    y += 6;
    doc.text(
      `• Ocupado: ${this.getChartValue(this.availabilityChart, 1)}`,
      margin,
      y
    );
    y += 6;
    doc.text(`• Total: ${this.filteredLaboratories.length}`, margin, y);

    y += 10;
    doc.text('Lista de Laboratorios:', margin, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [
        [
          'ID',
          'Nombre',
          'Descripción',
          'Disponibilidad',
          'Ubicación',
          'Equipos',
        ],
      ],
      body: this.filteredLaboratories.map((lab) => [
        lab.id.toString(),
        lab.name,
        lab.description,
        lab.availability,
        `${lab.location.building} - Piso ${lab.location.floor}`,
        lab.equipment.length.toString(),
      ]),
      margin: { left: margin },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    const chartRefs: {
      data: ChartData;
      type: 'bar' | 'line' | 'pie';
      title: string;
    }[] = [
      {
        data: this.availabilityChart,
        type: 'pie' as const,
        title: 'Distribución por Disponibilidad',
      },
      {
        data: this.equipmentChart,
        type: 'bar' as const,
        title: 'Cantidad de Equipos por Laboratorio',
      },
      {
        data: this.locationChart,
        type: 'pie' as const,
        title: 'Distribución por Ubicación',
      },
    ];

    for (const chart of chartRefs) {
      const chartImg = await this.renderHighResChart(chart.data, chart.type);
      doc.addPage();
      doc.setFontSize(14);
      doc.text(chart.title, margin, margin);
      doc.addImage(
        chartImg,
        'PNG',
        margin,
        margin + 5,
        pageWidth - margin * 2,
        110
      );

      const labels = chart.data.labels ?? [];
      const values = chart.data.datasets?.[0]?.data ?? [];
      let yCursor = margin + 120;

      doc.setFontSize(11);
      doc.text('Detalle de datos:', margin, yCursor);
      yCursor += 6;

      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const value = values[i];
        if (label !== undefined && value !== undefined) {
          doc.text(`• ${label}: ${value}`, margin, yCursor);
          yCursor += 6;
        }
      }
    }

    const fileName = this.generateFileName('pdf');
    doc.save(fileName);
  }

  generateFileName(extension: string): string {
    const now = new Date();
    return `reporte_laboratorios_${now
      .toISOString()
      .slice(0, 10)}_${now.getHours()}-${now.getMinutes()}.${extension}`;
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

        if (type === 'bar') {
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
