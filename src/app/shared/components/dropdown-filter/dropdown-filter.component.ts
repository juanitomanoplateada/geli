import {
  Component,
  Input,
  Output,
  EventEmitter,
  Signal,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UppercaseDirective } from '../../directives/uppercase/uppercase.directive';
import { ClickOutsideDirective } from '../../directives/click-outside/click-outside.directive';

@Component({
  selector: 'app-dropdown-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UppercaseDirective,
    ClickOutsideDirective,
  ],
  templateUrl: './dropdown-filter.component.html',
  styleUrls: ['./dropdown-filter.component.scss'],
})
export class DropdownFilterComponent {
  @Input() options: (string | { label: string; value: any })[] = [];
  @Input() selected: any = '';
  @Input() placeholder: string = 'Seleccione...';
  @Input() allowEmpty: string = 'Todos';
  @Output() selectedChange = new EventEmitter<any>();

  showDropdown = signal(false);
  searchTerm = signal('');

  // 🔍 Filtro compatible con string u objeto
  get filteredOptions(): (string | { label: string; value: any })[] {
    const term = this.searchTerm().trim().toLowerCase();
    return term === ''
      ? this.options || []
      : (this.options || []).filter((opt) => {
          const label = typeof opt === 'string' ? opt : opt.label;
          return label.toLowerCase().includes(term);
        });
  }

  select(option: string | { label: string; value: any }) {
    this.selectedChange.emit(this.getValue(option));
    this.showDropdown.set(false);
  }

  clearSelection() {
    this.selectedChange.emit('');
    this.showDropdown.set(false);
  }

  toggleDropdown() {
    this.showDropdown.set(!this.showDropdown());
    this.searchTerm.set('');
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }

  getLabel(opt: string | { label: string; value: any }): string {
    return typeof opt === 'string' ? opt : opt.label;
  }

  getValue(opt: string | { label: string; value: any }): any {
    return typeof opt === 'string' ? opt : opt.value;
  }

  searchTermValue(): string {
    return this.searchTerm();
  }
  getLabelFromValue(value: any): string {
    if (value === '' || value === null || value === undefined) return '';

    const match = this.options.find((opt) =>
      typeof opt === 'string' ? opt === value : opt.value === value
    );

    if (!match) return value; // ← evita romper si no encuentra

    return this.getLabel(match);
  }
}
