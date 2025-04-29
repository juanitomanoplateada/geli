import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'status' | 'actions';
}

interface ActionButton {
  label: string | ((row: any) => string);
  action: (row: any) => void;
  color?: string | ((row: any) => string);
}

@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.scss'],
})
export class ResultsTableComponent implements OnInit {
  @Input() columns: ColumnConfig[] = [];
  @Input() data: any[] = [];
  @Input() actionButtons: ActionButton[] = [];
  @Input() sortEnabled: boolean = true;
  @Input() trackByFunction: (index: number, item: any) => any = (index, item) =>
    item.id;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortedColumnIndex: number = -1; // ✅ para saber cuál columna ordenar

  gridTemplate: string = '';

  ngOnInit(): void {
    if (this.columns.length > 0) {
      this.sortBy(this.columns[0].key, false);
      this.buildGridTemplate();
    }
  }

  buildGridTemplate(): void {
    if (this.columns.length > 0) {
      this.gridTemplate = this.columns
        .map(() => 'minmax(120px, auto)')
        .join(' ');
    }
  }

  sortBy(column: string, toggleDirection: boolean = true): void {
    if (!this.sortEnabled) return;

    const index = this.columns.findIndex((c) => c.key === column);
    this.sortedColumnIndex = index;

    if (this.sortColumn === column && toggleDirection) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.data.sort((a, b) => {
      const aValue = (a[this.sortColumn] ?? '').toString().toLowerCase();
      const bValue = (b[this.sortColumn] ?? '').toString().toLowerCase();
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  isSortingBy(column: string): boolean {
    return this.sortColumn === column;
  }

  getSortIcon(column: string): string {
    if (!this.isSortingBy(column)) return '';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  /** Devuelve la etiqueta real, sea string o función */
  getLabel(action: ActionButton, row: any): string {
    return typeof action.label === 'function'
      ? action.label(row)
      : action.label;
  }

  /** Devuelve la clase de color real, sea string o función */
  getColor(action: ActionButton, row: any): string {
    const color =
      typeof action.color === 'function' ? action.color(row) : action.color;
    return color || 'primary';
  }
}
