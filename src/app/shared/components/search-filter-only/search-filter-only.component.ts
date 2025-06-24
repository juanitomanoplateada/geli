import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchAdvancedFieldsComponent } from '../search-advanced-fields/search-advanced-fields.component';
import { AdvancedSearchFiltersComponent } from '../advanced-search-filters/advanced-search-filters.component';
import { FieldConfig } from '../../model/field-config.model';

export type Filters = { [key: string]: any };
export type FilterOptions = { [key: string]: any };

@Component({
  selector: 'app-search-filter-only',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchAdvancedFieldsComponent,
    AdvancedSearchFiltersComponent,
  ],
  templateUrl: './search-filter-only.component.html',
  styleUrls: ['./search-filter-only.component.scss'],
})
export class SearchFilterOnlyComponent {
  @Input() isLoading: boolean = false;
  @Input() fieldsConfig: FieldConfig[] = [];
  @Input() options: FilterOptions = {};
  @Input() filters: Filters = {};
  @Input() availableFilterKeys: { key: string; label: string }[] = [];
  @Input() activeFilterKeys: string[] = [];
  @Input() buttonCleanFilters: boolean = false;

  @Output() filtersChange = new EventEmitter<Filters>();
  @Output() activeFilterKeysChange = new EventEmitter<string[]>();
  @Output() clearFilters = new EventEmitter<void>();

  onClear() {
    this.clearFilters.emit();
  }

  onActiveFiltersChange(updatedKeys: string[]) {
    const deactivatedKeys = this.activeFilterKeys.filter(
      (key) => !updatedKeys.includes(key)
    );
    for (const key of deactivatedKeys) {
      if (this.filters.hasOwnProperty(key)) {
        this.filters[key] = '';
      }
    }
    this.activeFilterKeysChange.emit(updatedKeys);
  }

  get activeFieldsConfig(): FieldConfig[] {
    return this.fieldsConfig.filter((field) =>
      this.activeFilterKeys.includes(field.key)
    );
  }
}
