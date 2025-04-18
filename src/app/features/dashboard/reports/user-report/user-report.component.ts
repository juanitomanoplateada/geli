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
  selector: 'app-user-report',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './user-report.component.html',
  styleUrls: ['./user-report.component.scss'],
})
export class UserReportComponent implements OnInit {
  activeTab = 'status';
  dateFilterType: 'creation' | 'modification' | 'assignment' = 'creation';
  isBrowser = false;

  @ViewChild('statusChartCanvas')
  statusCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('roleChartCanvas') roleCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('creationChartCanvas')
  creationCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('modificationChartCanvas')
  modificationCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('assignmentChartCanvas')
  assignmentCanvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  users = [
    {
      id: 1,
      name: 'Ana Torres',
      idNumber: '123',
      status: 'Activo',
      role: 'Analista de calidad',
      assignmentDate: new Date('2024-01-10'),
      creationDate: new Date('2024-01-01'),
      modificationDate: new Date('2024-02-01'),
    },
    {
      id: 2,
      name: 'Luis Ramírez',
      idNumber: '456',
      status: 'Inactivo',
      role: 'Personal autorizado',
      assignmentDate: new Date('2024-03-15'),
      creationDate: new Date('2024-03-01'),
      modificationDate: new Date('2024-03-25'),
    },
    {
      id: 3,
      name: 'Carlos Peña',
      idNumber: '789',
      status: 'Activo',
      role: 'Personal autorizado',
      assignmentDate: new Date('2024-04-10'),
      creationDate: new Date('2024-04-01'),
      modificationDate: new Date('2024-04-11'),
    },
  ];

  statusOptions = ['Activo', 'Inactivo'];
  roleOptions = ['Analista de calidad', 'Personal autorizado'];
  selectedStatus = '';
  selectedRole = '';
  startDate = '';
  endDate = '';
  filteredUsers = [...this.users];

  statusChart: ChartData<'bar'> = { labels: [], datasets: [] };
  roleChart: ChartData<'pie'> = { labels: [], datasets: [] };
  creationChart: ChartData<'line'> = { labels: [], datasets: [] };
  modificationChart: ChartData<'line'> = { labels: [], datasets: [] };
  assignmentChart: ChartData<'line'> = { labels: [], datasets: [] };

  ngOnInit(): void {
    this.updateCharts();
  }

  getBaseDate(user: any): Date {
    switch (this.dateFilterType) {
      case 'creation':
        return user.creationDate;
      case 'modification':
        return user.modificationDate;
      case 'assignment':
        return user.assignmentDate;
    }
  }

  filterUsers(): void {
    const from = this.startDate ? new Date(this.startDate).getTime() : null;
    const to = this.endDate ? new Date(this.endDate).getTime() : null;
    this.filteredUsers = this.users.filter((user) => {
      const date = this.getBaseDate(user).getTime();
      return (
        (!this.selectedStatus || user.status === this.selectedStatus) &&
        (!this.selectedRole || user.role === this.selectedRole) &&
        (!from || date >= from) &&
        (!to || date <= to)
      );
    });
    this.updateCharts();
  }

  resetFilters(): void {
    this.selectedStatus = '';
    this.selectedRole = '';
    this.startDate = '';
    this.endDate = '';
    this.dateFilterType = 'creation';
    this.filteredUsers = [...this.users];
    this.updateCharts();
  }

  updateCharts(): void {
    this.statusChart = this.getChart<'bar'>(
      this.statusOptions,
      'status',
      'bar'
    );
    this.roleChart = this.getChart<'pie'>(this.roleOptions, 'role', 'pie');
    this.creationChart = this.getLineChart('creationDate', 'Creación');
    this.modificationChart = this.getLineChart(
      'modificationDate',
      'Modificación'
    );
    this.assignmentChart = this.getLineChart('assignmentDate', 'Asignación');
  }

  getChart<T extends 'bar' | 'pie'>(
    labels: string[],
    field: 'status' | 'role',
    type: T
  ): ChartData<T> {
    const data = labels.map(
      (label) =>
        this.filteredUsers.filter((user) => user[field] === label).length
    );
    const chartData: ChartData = {
      labels,
      datasets: type === 'bar' ? [{ label: 'Cantidad', data }] : [{ data }],
    };
    return chartData as ChartData<T>;
  }

  getLineChart(
    dateField: keyof (typeof this.users)[0],
    label: string
  ): ChartData<'line'> {
    const grouped = new Map<string, number>();
    this.filteredUsers.forEach((user) => {
      const date = user[dateField] as Date;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}`;
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });
    return {
      labels: Array.from(grouped.keys()),
      datasets: [
        {
          label: `Usuarios por ${label}`,
          data: Array.from(grouped.values()),
        },
      ],
    };
  }

  getChartValue(chart: ChartData, index: number): number {
    return chart.datasets?.[0] && 'data' in chart.datasets[0]
      ? (chart.datasets[0].data as number[])[index] ?? 0
      : 0;
  }

  exportToExcel(): void {
    const fileName = this.generateFileName('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(
      this.filteredUsers.map((user) => ({
        ID: user.id,
        Nombre: user.name,
        Identificación: user.idNumber,
        Estado: user.status,
        Rol: user.role,
        Asignación: user.assignmentDate.toLocaleDateString(),
        Creación: user.creationDate.toLocaleDateString(),
        Modificación: user.modificationDate.toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
    XLSX.writeFile(workbook, fileName);
  }

  exportToCSV(): void {
    const fileName = this.generateFileName('csv');
    const worksheet = XLSX.utils.json_to_sheet(
      this.filteredUsers.map((user) => ({
        ID: user.id,
        Nombre: user.name,
        Identificación: user.idNumber,
        Estado: user.status,
        Rol: user.role,
        Asignación: user.assignmentDate.toLocaleDateString(),
        Creación: user.creationDate.toLocaleDateString(),
        Modificación: user.modificationDate.toLocaleDateString(),
      }))
    );
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), fileName);
  }

  generateFileName(ext: string): string {
    const date = new Date();
    return `reporte_usuarios_${date
      .toISOString()
      .slice(0, 10)}_${date.getHours()}-${date.getMinutes()}.${ext}`;
  }

  async onExportPDF(): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(18);
    doc.text('Reporte de Usuarios', pageWidth / 2, y, { align: 'center' });

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

    const labelMap = {
      creation: 'Creación',
      modification: 'Modificación',
      assignment: 'Asignación',
    };

    const filters = [
      `• Estado: ${this.selectedStatus || 'Todos'}`,
      `• Rol: ${this.selectedRole || 'Todos'}`,
      `• Rango de Fechas (${labelMap[this.dateFilterType]}): ${
        this.startDate || 'N/A'
      } - ${this.endDate || 'N/A'}`,
    ];

    filters.forEach((f) => {
      doc.text(f, margin, y);
      y += 6;
    });

    y += 10;
    doc.text('Resumen:', margin, y);
    y += 8;

    const stats = [
      `• Activos: ${this.getChartValue(this.statusChart, 0)}`,
      `• Inactivos: ${this.getChartValue(this.statusChart, 1)}`,
      `• Total: ${this.filteredUsers.length}`,
      `• Analistas de Calidad: ${this.getChartValue(this.roleChart, 0)}`,
      `• Personal Autorizado: ${this.getChartValue(this.roleChart, 1)}`,
    ];

    stats.forEach((stat) => {
      doc.text(stat, margin, y);
      y += 6;
    });

    y += 10;
    doc.text('Lista de Usuarios:', margin, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [
        [
          'ID',
          'Nombre',
          'Identificación',
          'Estado',
          'Rol',
          'Creación',
          'Modificación',
          'Asignación',
        ],
      ],
      body: this.filteredUsers.map((u) => [
        u.id.toString(),
        u.name,
        u.idNumber,
        u.status,
        u.role,
        u.creationDate.toLocaleDateString(),
        u.modificationDate.toLocaleDateString(),
        u.assignmentDate.toLocaleDateString(),
      ]),
      margin: { left: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
      },
      didDrawPage: (data) => {
        if (data?.cursor?.y != null) {
          y = data.cursor.y + 10;
        }
      },
    });

    await new Promise((res) => setTimeout(res, 500));

    const canvasRefs = [
      { ref: this.statusCanvasRef, title: 'Distribución por Estados' },
      { ref: this.roleCanvasRef, title: 'Distribución por Roles' },
      { ref: this.creationCanvasRef, title: 'Usuarios por Fecha de Creación' },
      {
        ref: this.modificationCanvasRef,
        title: 'Usuarios por Fecha de Modificación',
      },
      {
        ref: this.assignmentCanvasRef,
        title: 'Usuarios por Fecha de Asignación',
      },
    ];

    for (const chart of canvasRefs) {
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
}
