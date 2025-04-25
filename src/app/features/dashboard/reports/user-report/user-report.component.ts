import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartData } from 'chart.js/auto';
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
  activeTab = 'role';
  dateFilterType: 'creation' | 'modification' | 'assignment' = 'creation';
  isBrowser = false;

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

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.updateCharts();
  }

  getBaseDate(user: any): Date {
    return user[`${this.dateFilterType}Date`];
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
    this.statusChart = this.getChart(this.statusOptions, 'status', 'bar');
    this.roleChart = this.getChart(this.roleOptions, 'role', 'pie');
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
    return {
      labels,
      datasets: type === 'bar' ? [{ label: 'Cantidad', data }] : [{ data }],
    } as ChartData<T>;
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
        { label: `Usuarios por ${label}`, data: Array.from(grouped.values()) },
      ],
    };
  }

  getChartValue(chart: ChartData, index: number): number {
    return chart.datasets?.[0] && 'data' in chart.datasets[0]
      ? (chart.datasets[0].data as number[])[index] ?? 0
      : 0;
  }

  private mapUsersForExport(): any[] {
    return this.filteredUsers.map((user) => ({
      ID: user.id,
      Nombre: user.name,
      Identificación: user.idNumber,
      Rol: user.role,
      Estado: user.status,
      Creación: user.creationDate.toLocaleDateString(),
      Asignación: user.assignmentDate.toLocaleDateString(),
      Modificación: user.modificationDate.toLocaleDateString(),
    }));
  }

  exportToExcel(): void {
    const fileName = this.generateFileName('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(this.mapUsersForExport());
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
    XLSX.writeFile(workbook, fileName);
  }

  exportToCSV(): void {
    const fileName = this.generateFileName('csv');
    const worksheet = XLSX.utils.json_to_sheet(this.mapUsersForExport());
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, fileName);
  }

  generateFileName(ext: string): string {
    const date = new Date();
    return `reporte_usuarios_${date
      .toISOString()
      .slice(0, 10)}_${date.getHours()}-${date.getMinutes()}.${ext}`;
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

  async onExportPDF(): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin;

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
    y += 1;

    const labelMap = {
      creation: 'Creación',
      modification: 'Modificación',
      assignment: 'Asignación',
    };

    const filters = [
      `• Rol: ${this.selectedRole || 'Todos'}`,
      `• Estado: ${this.selectedStatus || 'Todos'}`,
      `• Rango de Fechas (${labelMap[this.dateFilterType]}): ${
        this.startDate || 'N/A'
      } - ${this.endDate || 'N/A'}`,
    ];

    filters.forEach((f) => doc.text(f, margin, (y += 6)));
    y += 10;

    doc.text('Resumen:', margin, y);
    const stats = [
      `• Activos: ${this.getChartValue(this.statusChart, 0)}`,
      `• Inactivos: ${this.getChartValue(this.statusChart, 1)}`,
      `• Total: ${this.filteredUsers.length}`,
      `• Analistas de Calidad: ${this.getChartValue(this.roleChart, 0)}`,
      `• Personal Autorizado: ${this.getChartValue(this.roleChart, 1)}`,
    ];

    stats.forEach((stat) => doc.text(stat, margin, (y += 6)));
    y += 10;

    y += 3;
    doc.text('Lista de Usuarios:', margin, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [
        [
          'ID',
          'Nombre',
          'Identificación',
          'Rol',
          'Estado',
          'Creación',
          'Asignación',
          'Modificación',
        ],
      ],
      body: this.mapUsersForExport().map((u) => Object.values(u)),
      margin: { left: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      didDrawPage: (data) => {
        if (data?.cursor?.y) {
          y = data.cursor.y + 10;
        }
      },
    });

    const chartRefs: {
      data: ChartData;
      type: 'bar' | 'line' | 'pie';
      title: string;
    }[] = [
      {
        data: this.statusChart,
        type: 'bar',
        title: 'Distribución por Estados',
      },
      { data: this.roleChart, type: 'pie', title: 'Distribución por Roles' },
      {
        data: this.creationChart,
        type: 'line',
        title: 'Usuarios por Creación',
      },
      {
        data: this.modificationChart,
        type: 'line',
        title: 'Usuarios por Modificación',
      },
      {
        data: this.assignmentChart,
        type: 'line',
        title: 'Usuarios por Asignación',
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
}
