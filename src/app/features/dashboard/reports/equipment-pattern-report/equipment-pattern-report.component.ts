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

(jsPDF as any).autoTable = autoTable;

@Component({
  selector: 'app-equipment-pattern-report',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './equipment-pattern-report.component.html',
  styleUrls: ['./equipment-pattern-report.component.scss'],
})
export class EquipmentPatternReportComponent implements OnInit {
  activeTab: 'availability' | 'function' | 'laboratory' = 'availability';
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
    return {
      labels,
      datasets: [{ label: 'Cantidad', data }],
    } as ChartData<T>;
  }

  getChartValue(chart: ChartData, index: number): number {
    return chart.datasets?.[0] && 'data' in chart.datasets[0]
      ? (chart.datasets[0].data as number[])[index] ?? 0
      : 0;
  }

  exportToExcel(): void {
    const fileName = this.generateFileName('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(
      this.filteredEquipment.map((eq) => ({
        ID: eq.id,
        Nombre: eq.name,
        Marca: eq.brand,
        'N° Inventario': eq.inventoryNumber,
        Disponibilidad: eq.availability,
        Función: eq.function.name,
        Laboratorio: eq.laboratory.name,
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
        Marca: eq.brand,
        'N° Inventario': eq.inventoryNumber,
        Disponibilidad: eq.availability,
        Función: eq.function.name,
        Laboratorio: eq.laboratory.name,
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
    });

    const chartRefs = [
      { ref: this.availabilityChartCanvas, title: 'Disponibilidad de Equipos' },
      { ref: this.functionChartCanvas, title: 'Distribución por Función' },
      {
        ref: this.laboratoryChartCanvas,
        title: 'Distribución por Laboratorio',
      },
    ];

    for (const chart of chartRefs) {
      try {
        const img = chart.ref.nativeElement.toDataURL('image/png');
        doc.addPage();
        doc.setFontSize(14);
        doc.text(chart.title, margin, margin);
        doc.addImage(
          img,
          'PNG',
          margin,
          margin + 5,
          pageWidth - margin * 2,
          80
        );
      } catch (err) {
        console.warn(`⚠️ No se pudo capturar el gráfico: ${chart.title}`, err);
      }
    }

    const fileName = this.generateFileName('pdf');
    doc.save(fileName);
  }

  generateFileName(extension: string): string {
    const now = new Date();
    return `reporte_equipos_${now
      .toISOString()
      .slice(0, 10)}_${now.getHours()}-${now.getMinutes()}.${extension}`;
  }
}
