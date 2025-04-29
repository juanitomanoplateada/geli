import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Este componente es el que permite seleccionar qué filtros visibles quieres activar (aunque ahora ya casi no es estrictamente necesario si haces campos fijos).

@Component({
  selector: 'app-advanced-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advanced-search-filters.component.html',
  styleUrls: ['./advanced-search-filters.component.scss'],
})
export class AdvancedSearchFiltersComponent {
  /** Lista de filtros disponibles */
  @Input() availableFilters: { key: string; label: string }[] = [];

  /** Lista de filtros activos actualmente */
  @Input() activeFilters: string[] = [];

  /** Emite cuando cambian los filtros activos */
  @Output() activeFiltersChange = new EventEmitter<string[]>();

  /** Selecciona todos los filtros */
  selectAll(): void {
    const allKeys = this.availableFilters.map((f) => f.key);
    this.activeFiltersChange.emit(allKeys);
  }

  /** Deselecciona todos los filtros */
  deselectAll(): void {
    this.activeFiltersChange.emit([]);
  }

  /** Alterna un filtro individualmente */
  toggleFilter(key: string): void {
    const updated = this.activeFilters.includes(key)
      ? this.activeFilters.filter((k) => k !== key) // si está activo, lo quitamos
      : [...this.activeFilters, key]; // si no está activo, lo agregamos
    this.activeFiltersChange.emit(updated);
  }
}
