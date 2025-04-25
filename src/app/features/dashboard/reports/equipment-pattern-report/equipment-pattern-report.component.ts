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
import { Chart, ChartData } from 'chart.js/auto';
import { NgChartsModule } from 'ng2-charts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DropdownFilterComponent } from '../../../../shared/components/dropdown-filter/dropdown-filter.component';

(jsPDF as any).autoTable = autoTable;

@Component({
  selector: 'app-equipment-pattern-report',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, DropdownFilterComponent],
  templateUrl: './equipment-pattern-report.component.html',
  styleUrls: ['./equipment-pattern-report.component.scss'],
})
export class EquipmentPatternReportComponent implements OnInit {
  activeTab: 'availability' | 'function' | 'laboratory' = 'function';
  isBrowser = false;

  @ViewChild('availabilityChartCanvas')
  availabilityChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('functionChartCanvas')
  functionChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('laboratoryChartCanvas')
  laboratoryChartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  equipmentList = [
    {
      id: 1,
      name: 'Microscopio',
      brand: 'Nikon',
      inventoryNumber: 'EQ-001',
      availability: 'Disponible',
      function: { name: 'Observación' },
      laboratory: { name: 'Laboratorio de Biología' },
    },
    {
      id: 2,
      name: 'Balanza analítica',
      brand: 'Mettler',
      inventoryNumber: 'EQ-002',
      availability: 'Ocupado',
      function: { name: 'Medición' },
      laboratory: { name: 'Laboratorio de Física' },
    },
    {
      id: 3,
      name: 'Fuente DC',
      brand: 'BK Precision',
      inventoryNumber: 'EQ-003',
      availability: 'Disponible',
      function: { name: 'Alimentación' },
      laboratory: { name: 'Laboratorio de Electrónica' },
    },
  ];

  availabilityOptions = ['Disponible', 'Ocupado'];
  functionOptions = ['Observación', 'Medición', 'Alimentación'];
  laboratoryOptions = [
    'Laboratorio de Biología',
    'Laboratorio de Física',
    'Laboratorio de Electrónica',
  ];

  selectedAvailability = '';
  selectedFunction = '';
  selectedLaboratory = '';
  filteredEquipment = [...this.equipmentList];

  availabilityChart: ChartData<'pie'> = { labels: [], datasets: [] };
  functionChart: ChartData<'bar'> = { labels: [], datasets: [] };
  laboratoryChart: ChartData<'bar'> = { labels: [], datasets: [] };

  ngOnInit(): void {
    this.updateCharts();
  }

  onFunctionChange(selected: string): void {
    this.selectedFunction = selected;
    this.filterEquipment();
  }

  onLaboratoryChange(selected: string): void {
    this.selectedLaboratory = selected;
    this.filterEquipment();
  }

  filterEquipment(): void {
    this.filteredEquipment = this.equipmentList.filter(
      (eq) =>
        (!this.selectedAvailability ||
          eq.availability === this.selectedAvailability) &&
        (!this.selectedFunction ||
          eq.function.name === this.selectedFunction) &&
        (!this.selectedLaboratory ||
          eq.laboratory.name === this.selectedLaboratory)
    );
    this.updateCharts();
  }

  resetFilters(): void {
    this.selectedAvailability = '';
    this.selectedFunction = '';
    this.selectedLaboratory = '';
    this.filteredEquipment = [...this.equipmentList];
    this.updateCharts();
  }

  updateCharts(): void {
    this.availabilityChart = this.buildPieChart(
      this.availabilityOptions,
      'availability'
    );
    this.functionChart = this.buildBarChart(this.functionOptions, 'function');
    this.laboratoryChart = this.buildBarChart(
      this.laboratoryOptions,
      'laboratory'
    );
  }

  buildPieChart<T extends 'pie'>(
    labels: string[],
    field: 'availability'
  ): ChartData<T> {
    const data = labels.map(
      (label) =>
        this.filteredEquipment.filter((eq) => eq[field] === label).length
    );
    return { labels, datasets: [{ data }] } as ChartData<T>;
  }

  buildBarChart<T extends 'bar'>(
    labels: string[],
    field: 'function' | 'laboratory'
  ): ChartData<T> {
    const data = labels.map(
      (label) =>
        this.filteredEquipment.filter((eq) => eq[field].name === label).length
    );
    return { labels, datasets: [{ label: 'Cantidad', data }] } as ChartData<T>;
  }

  getChartValue(chart: ChartData, index: number): number {
    return chart.datasets?.[0] && 'data' in chart.datasets[0]
      ? (chart.datasets[0].data as number[])[index] ?? 0
      : 0;
  }

  async renderHighResChart(
    chartData: ChartData,
    type: 'bar' | 'pie',
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

  async exportToPDF(): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    doc.setFontSize(18);
    doc.text('Reporte de Equipos / Patrones', pageWidth / 2, y, {
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
    y += 8;
    doc.text(
      `• Disponibilidad: ${this.selectedAvailability || 'Todas'}`,
      margin,
      y
    );
    y += 6;
    doc.text(`• Función: ${this.selectedFunction || 'Todas'}`, margin, y);
    y += 6;
    doc.text(`• Laboratorio: ${this.selectedLaboratory || 'Todos'}`, margin, y);

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
    doc.text(`• Total: ${this.filteredEquipment.length}`, margin, y);

    y += 10;
    doc.text('Lista de Equipos / Patrones:', margin, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [
        [
          'ID',
          'Nombre',
          'Marca',
          'N° Inventario',
          'Disponibilidad',
          'Función',
          'Laboratorio',
        ],
      ],
      body: this.filteredEquipment.map((eq) => [
        eq.id.toString(),
        eq.name,
        eq.brand,
        eq.inventoryNumber,
        eq.availability,
        eq.function.name,
        eq.laboratory.name,
      ]),
      margin: { left: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      didDrawPage: (data) => {
        if (data?.cursor?.y != null) y = data.cursor.y + 10;
      },
    });

    const chartRefs = [
      {
        data: this.availabilityChart,
        type: 'pie',
        title: 'Disponibilidad de Equipos',
      },
      {
        data: this.functionChart,
        type: 'bar',
        title: 'Distribución por Función',
      },
      {
        data: this.laboratoryChart,
        type: 'bar',
        title: 'Distribución por Laboratorio',
      },
    ];

    for (const chart of chartRefs) {
      const chartImg = await this.renderHighResChart(
        chart.data,
        chart.type as 'bar' | 'pie'
      );
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

  exportToExcel(): void {
    const fileName = this.generateFileName('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(
      this.filteredEquipment.map((eq) => ({
        ID: eq.id,
        Nombre: eq.name,
        Función: eq.function.name,
        Laboratorio: eq.laboratory.name,
        Disponibilidad: eq.availability,
        Marca: eq.brand,
        'N° Inventario': eq.inventoryNumber,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Equipos');
    XLSX.writeFile(workbook, fileName);
  }

  exportToCSV(): void {
    const fileName = this.generateFileName('csv');
    const worksheet = XLSX.utils.json_to_sheet(
      this.filteredEquipment.map((eq) => ({
        ID: eq.id,
        Nombre: eq.name,
        Función: eq.function.name,
        Laboratorio: eq.laboratory.name,
        Disponibilidad: eq.availability,
        Marca: eq.brand,
        'N° Inventario': eq.inventoryNumber,
      }))
    );
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), fileName);
  }

  generateFileName(extension: string): string {
    const now = new Date();
    return `reporte_equipos_${now
      .toISOString()
      .slice(0, 10)}_${now.getHours()}-${now.getMinutes()}.${extension}`;
  }
}
