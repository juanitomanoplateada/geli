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
  selector: 'app-laboratory-report',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './laboratory-report.component.html',
  styleUrls: ['./laboratory-report.component.scss'],
})
export class LaboratoryReportComponent implements OnInit {
  activeTab: 'availability' | 'equipment' = 'availability';
  isBrowser = false;

  @ViewChild('availabilityChartCanvas')
  availabilityChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('equipmentChartCanvas')
  equipmentChartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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
  selectedAvailability = '';
  filteredLaboratories = [...this.laboratories];

  availabilityChart: ChartData<'pie'> = { labels: [], datasets: [] };
  equipmentChart: ChartData<'bar'> = { labels: [], datasets: [] };

  ngOnInit(): void {
    this.updateCharts();
  }

  filterLaboratories(): void {
    this.filteredLaboratories = this.laboratories.filter(
      (lab) =>
        !this.selectedAvailability ||
        lab.availability === this.selectedAvailability
    );
    this.updateCharts();
  }

  resetFilters(): void {
    this.selectedAvailability = '';
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
  }

  buildPieChart<T extends 'pie'>(
    labels: string[],
    field: 'availability'
  ): ChartData<T> {
    const data = labels.map(
      (label) =>
        this.filteredLaboratories.filter((lab) => lab[field] === label).length
    );
    return {
      labels,
      datasets: [{ data }],
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

    const chartRefs = [
      {
        ref: this.availabilityChartCanvas,
        title: 'Disponibilidad de Laboratorios',
      },
      {
        ref: this.equipmentChartCanvas,
        title: 'Cantidad de Equipos por Laboratorio',
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
    return `reporte_laboratorios_${now
      .toISOString()
      .slice(0, 10)}_${now.getHours()}-${now.getMinutes()}.${extension}`;
  }
}
