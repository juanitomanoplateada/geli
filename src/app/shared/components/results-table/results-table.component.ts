import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaces
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
  // Inputs
  @Input() columns: ColumnConfig[] = [];
  @Input() data: any[] = [];
  @Input() actionButtons: ActionButton[] = [];
  @Input() sortEnabled: boolean = true;
  @Input() trackByFunction: (index: number, item: any) => any = (index, item) =>
    item.id;

  // Variables de estado
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortedColumnIndex: number = -1;
  gridTemplate: string = '';

  // Lifecycle hooks
  ngOnInit(): void {
    if (this.columns.length > 0) {
      this.sortBy(this.columns[0].key, false);
      this.buildGridTemplate();
    }
  }

  // Métodos de inicialización
  private buildGridTemplate(): void {
    if (this.columns.length > 0) {
      this.gridTemplate = this.columns
        .map(() => 'minmax(120px, auto)')
        .join(' ');
    }
  }

  // Métodos de ordenación
  sortBy(column: string, toggleDirection: boolean = true): void {
    if (!this.sortEnabled) return;

    this.updateSortState(column, toggleDirection);
    this.sortData();
  }

  private updateSortState(column: string, toggleDirection: boolean): void {
    const index = this.columns.findIndex((c) => c.key === column);
    this.sortedColumnIndex = index;

    if (this.sortColumn === column && toggleDirection) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  private sortData(): void {
    this.data.sort((a, b) => {
      const aValue = (a[this.sortColumn] ?? '').toString().toLowerCase();
      const bValue = (b[this.sortColumn] ?? '').toString().toLowerCase();

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Métodos de utilidad para la vista
  isSortingBy(column: string): boolean {
    return this.sortColumn === column;
  }

  getSortIcon(column: string): string {
    if (!this.isSortingBy(column)) return '';
    return this.sortDirection === 'asc' ? '↓' : '↑';
  }

  getLabel(action: ActionButton, row: any): string {
    return typeof action.label === 'function'
      ? action.label(row)
      : action.label;
  }

  getColor(action: ActionButton, row: any): string {
    const color =
      typeof action.color === 'function' ? action.color(row) : action.color;
    return color || 'primary';
  }

  isAvailableStatus(status: string): boolean {
    if (!status) return false;
    const statusStr = status.toLowerCase();
    return statusStr === 'activo' || statusStr === 'disponible';
  }
}
