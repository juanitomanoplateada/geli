import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownFilterComponent } from '../../components/dropdown-filter/dropdown-filter.component';
import { FieldConfig } from '../../model/field-config.model';

@Component({
  selector: 'app-search-advanced-fields',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownFilterComponent, // 👈 AÑADELO AQUÍ
  ],
  templateUrl: './search-advanced-fields.component.html',
  styleUrls: ['./search-advanced-fields.component.scss'],
})
export class SearchAdvancedFieldsComponent {
  @Input() filters: { [key: string]: any } = {};
  @Input() options: { [key: string]: any } = {};
  @Input() fieldsConfig: FieldConfig[] = [];
  @Input() isLoading: boolean = false;

  @Output() filtersChange = new EventEmitter<{ [key: string]: any }>();

  emitFilters() {
    this.filtersChange.emit(this.filters);
  }
  isStringArray(value: any): value is string[] {
    return Array.isArray(value) && typeof value[0] === 'string';
  }

  isObjectArray(value: any): value is { label: string; value: any }[] {
    return (
      Array.isArray(value) &&
      typeof value[0] === 'object' &&
      'label' in value[0]
    );
  }
}
