import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

(jsPDF as any).autoTable = autoTable;

interface Laboratory {
  id: number;
  name: string;
  location: string;
  availability: string;
  equipment: Equipment[];
}

interface Equipment {
  id: number;
  name: string;
  brand: string;
  inventoryNumber: string;
  availability: string;
  function: string;
}

@Component({
  selector: 'app-lab-equipment-report',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './lab-equipment-report.component.html',
  styleUrls: ['./lab-equipment-report.component.scss'],
})
export class LabEquipmentReportComponent implements OnInit {
  isBrowser = false;
  activeTab: 'availability' | 'function' = 'availability';

  @ViewChild('availabilityChartCanvas') availabilityChartCanvas!: ElementRef;
  @ViewChild('functionChartCanvas') functionChartCanvas!: ElementRef;

  laboratories: Laboratory[] = [
    {
      id: 1,
      name: 'Laboratorio de Física',
      location: 'Edificio A - Piso 1',
      availability: 'Disponible',
      equipment: [
        {
          id: 101,
          name: 'Osciloscopio',
          brand: 'Tektronix',
          inventoryNumber: 'EQ-001',
          availability: 'Disponible',
          function: 'Medición',
        },
        {
          id: 102,
          name: 'Generador de señales',
          brand: 'Keysight',
          inventoryNumber: 'EQ-002',
          availability: 'Ocupado',
          function: 'Generación',
        },
      ],
    },
    {
      id: 2,
      name: 'Laboratorio de Química',
      location: 'Edificio B - Piso 2',
      availability: 'Ocupado',
      equipment: [
        {
          id: 103,
          name: 'PHmetro',
          brand: 'Hanna',
          inventoryNumber: 'EQ-003',
          availability: 'Disponible',
          function: 'Análisis',
        },
      ],
    },
  ];

  selectedLab: Laboratory | null = null;
  labSearchTerm = '';
  filteredLaboratories: Laboratory[] = [];
  filteredEquipment: Equipment[] = [];

  availabilityChart: ChartData<'pie'> = { labels: [], datasets: [] };
  functionChart: ChartData<'bar'> = { labels: [], datasets: [] };

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.filteredLaboratories = [...this.laboratories];
  }

  selectLaboratory(lab: Laboratory): void {
    this.selectedLab = lab;
    this.filteredEquipment = [...lab.equipment];
    this.updateCharts();
  }

  resetLabSelection(): void {
    this.selectedLab = null;
    this.filteredEquipment = [];
    this.availabilityChart = { labels: [], datasets: [] };
    this.functionChart = { labels: [], datasets: [] };
  }

  updateCharts(): void {
    const availOptions = ['Disponible', 'Ocupado'];
    const funcOptions = [
      ...new Set(this.filteredEquipment.map((e) => e.function)),
    ];

    this.availabilityChart = this.buildPieChart(availOptions, 'availability');
    this.functionChart = this.buildBarChart(funcOptions, 'function');
  }

  buildPieChart<T extends 'pie'>(
    labels: string[],
    field: keyof Equipment
  ): ChartData<T> {
    const data = labels.map(
      (label) =>
        this.filteredEquipment.filter((eq) => eq[field] === label).length
    );
    return { labels, datasets: [{ data }] } as ChartData<T>;
  }

  buildBarChart<T extends 'bar'>(
    labels: string[],
    field: keyof Equipment
  ): ChartData<T> {
    const data = labels.map(
      (label) =>
        this.filteredEquipment.filter((eq) => eq[field] === label).length
    );
    return { labels, datasets: [{ label: 'Cantidad', data }] } as ChartData<T>;
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
        Función: eq.function,
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
        Función: eq.function,
      }))
    );
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), fileName);
  }

  async exportToPDF(): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin;

    doc.setFontSize(18);
    doc.text('Reporte de Equipos por Laboratorio', pageWidth / 2, y, {
      align: 'center',
    });

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
    doc.text('Información del Laboratorio:', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`• Nombre: ${this.selectedLab?.name}`, margin, y);
    y += 6;
    doc.text(`• Ubicación: ${this.selectedLab?.location}`, margin, y);
    y += 6;
    doc.text(`• Disponibilidad: ${this.selectedLab?.availability}`, margin, y);
    y += 6;
    doc.text(`• Total Equipos: ${this.filteredEquipment.length}`, margin, y);

    y += 10;
    doc.setFontSize(12);
    doc.text('Listado de Equipos:', margin, y);

    autoTable(doc, {
      startY: y + 5,
      head: [
        ['ID', 'Nombre', 'Marca', 'N° Inventario', 'Disponibilidad', 'Función'],
      ],
      body: this.filteredEquipment.map((eq) => [
        eq.id.toString(),
        eq.name,
        eq.brand,
        eq.inventoryNumber,
        eq.availability,
        eq.function,
      ]),
      margin: { left: margin },
      styles: { fontSize: 9, cellPadding: 2 },
    });

    const charts = [
      {
        title: 'Distribución por Disponibilidad',
        data: this.availabilityChart,
        type: 'pie' as const,
      },
      {
        title: 'Distribución por Función',
        data: this.functionChart,
        type: 'bar' as const,
      },
    ];

    for (const chart of charts) {
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

      // Leyenda numérica debajo
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

    doc.save(this.generateFileName('pdf'));
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
            type === 'bar'
              ? {
                  x: { ticks: { font: { size: 18 } } },
                  y: { ticks: { font: { size: 18 } } },
                }
              : undefined,
        },
      });

      setTimeout(() => {
        const meta = chart.getDatasetMeta(0);
        const dataset = chart.data.datasets[0];
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#111';
        ctx.textAlign = 'center';

        if (type === 'bar') {
          meta.data.forEach((bar: any, i: number) => {
            const value = dataset.data?.[i];
            if (value !== undefined) {
              ctx.fillText(String(value), bar.x, bar.y - 10);
            }
          });
        }

        if (type === 'pie') {
          const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
          meta.data.forEach((arc: any, i: number) => {
            const value = dataset.data[i];
            const angle = (arc.startAngle + arc.endAngle) / 2;
            const radius = arc.outerRadius * 0.75;
            const x = arc.x + Math.cos(angle) * radius;
            const y = arc.y + Math.sin(angle) * radius;
            const percent = Math.round((Number(value) / total) * 100);
            ctx.fillText(`${percent}%`, x, y);
          });
        }

        const img = canvas.toDataURL('image/png');
        chart.destroy();
        resolve(img);
      }, 500);
    });
  }

  generateFileName(ext: string): string {
    const now = new Date();
    return `reporte_equipos_laboratorio_${now
      .toISOString()
      .slice(0, 10)}_${now.getHours()}-${now.getMinutes()}.${ext}`;
  }

  getChartValue(chart: ChartData, index: number): number {
    const dataset = chart.datasets?.[0];
    if (!dataset || !Array.isArray(dataset.data)) return 0;
    const value = dataset.data[index];
    return typeof value === 'number' ? value : Number(value) || 0;
  }

  filteredLaboratoriesFilteredBySearch(): Laboratory[] {
    const term = this.labSearchTerm.trim().toLowerCase();
    return this.filteredLaboratories.filter((lab) =>
      lab.name.toLowerCase().includes(term)
    );
  }
}
