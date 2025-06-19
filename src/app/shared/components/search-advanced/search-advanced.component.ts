import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchAdvancedFieldsComponent } from '../search-advanced-fields/search-advanced-fields.component';
import { AdvancedSearchFiltersComponent } from '../advanced-search-filters/advanced-search-filters.component';
import { FieldConfig } from '../../model/field-config.model';
import { InputRulesDirective } from '../../directives/input-rules/input-rules';

// Tipos dinámicos
export type Filters = { [key: string]: any };
export type FilterOptions = { [key: string]: any };

@Component({
  selector: 'app-search-advanced',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputRulesDirective,
    SearchAdvancedFieldsComponent,
    AdvancedSearchFiltersComponent,
  ],
  templateUrl: './search-advanced.component.html',
  styleUrls: ['./search-advanced.component.scss'],
})
export class SearchAdvancedComponent {
  @Input() placeholder: string = 'Buscar...';

  /** Búsqueda general (texto) */
  @Input() searchQuery: string = '';

  /** Estado de carga */
  @Input() isLoading: boolean = false;

  /** Mostrar/Ocultar filtros avanzados */
  @Input() showAdvancedSearch: boolean = false;

  /** Todos los filtros posibles */
  @Input() fieldsConfig: FieldConfig[] = [];

  /** Opciones de filtros dropdown */
  @Input() options: FilterOptions = {};

  /** Estado actual de los filtros */
  @Input() filters: Filters = {};

  /** Lista de filtros disponibles para seleccionar */
  @Input() availableFilterKeys: { key: string; label: string }[] = [];

  /** Filtros actualmente activos */
  @Input() activeFilterKeys: string[] = [];

  @Input() currentPage: number = 0;
  @Input() totalPages: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 30, 40, 50];
  @Input() hasData: boolean = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  /** Emitir cambio en texto de búsqueda */
  @Output() searchQueryChange = new EventEmitter<string>();

  /** Emitir cambio de filtros */
  @Output() filtersChange = new EventEmitter<Filters>();

  /** Emitir cambio de filtros activos */
  @Output() activeFilterKeysChange = new EventEmitter<string[]>();

  /** Ejecutar búsqueda */
  @Output() triggerSearch = new EventEmitter<void>();

  /** Limpiar filtros */
  @Output() clearFilters = new EventEmitter<void>();

  /** Alternar filtros avanzados */
  @Output() toggleAdvanced = new EventEmitter<void>();

  /** Ejecutar búsqueda */
  onSearch() {
    this.triggerSearch.emit();
  }

  /** Limpiar filtros */
  onClear() {
    this.clearFilters.emit();
  }

  /** Mostrar/ocultar filtros avanzados */
  onToggleAdvanced() {
    this.toggleAdvanced.emit();
  }

  /** Cuando cambia qué filtros están activos */
  onActiveFiltersChange(updatedKeys: string[]) {
    // 🔥 Identificar qué filtros fueron desactivados
    const deactivatedKeys = this.activeFilterKeys.filter(
      (key) => !updatedKeys.includes(key)
    );

    // 🔥 Para cada filtro que se desactivó, reseteamos su valor
    for (const key of deactivatedKeys) {
      if (this.filters.hasOwnProperty(key)) {
        this.filters[key] = ''; // lo dejamos en blanco o "Todos"
      }
    }

    // 🔥 Actualizamos lista de filtros activos
    this.activeFilterKeysChange.emit(updatedKeys);

    // 🔥 Forzar búsqueda otra vez para reflejar cambios
    this.triggerSearch.emit();
  }

  get activeFieldsConfig(): FieldConfig[] {
    return this.fieldsConfig.filter((field) =>
      this.activeFilterKeys.includes(field.key)
    );
  }

  clearInput() {
    this.searchQuery = '';
    this.searchQueryChange.emit('');
    this.onClear();
  }

  onPageChange(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.pageChange.emit(newPage);
    }
  }

  onPageSizeChange(size: number) {
    this.pageSizeChange.emit(size);
  }
}
