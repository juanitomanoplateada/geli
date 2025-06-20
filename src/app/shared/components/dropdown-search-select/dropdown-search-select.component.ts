import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../directives/click-outside/click-outside.directive';
import { InputRulesDirective } from '../../directives/input-rules/input-rules';

@Component({
  selector: 'app-dropdown-search-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ClickOutsideDirective,
    InputRulesDirective,
  ],
  templateUrl: './dropdown-search-select.component.html',
  styleUrls: ['./dropdown-search-select.component.scss'],
})
export class DropdownSearchSelectComponent<T = any> {
  @Input() displayKey: string = 'label';
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() options: { label: string; value: T }[] = [];
  @Input() selectedValue: T | null = null;
  @Input() disabled = false;

  @Output() select = new EventEmitter<T>();

  showDropdown = signal(false);
  searchTerm = signal('');

  get filteredOptions(): { label: string; value: T }[] {
    const term = this.searchTerm().toUpperCase();
    return this.options.filter((opt) => opt.label.toUpperCase().includes(term));
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.showDropdown.update((v) => !v);
    }
  }

  onSelect(option: { label: string; value: T }): void {
    this.select.emit(option.value);
    this.resetDropdown();
  }

  close(): void {
    this.resetDropdown();
  }

  resetDropdown() {
    this.searchTerm.set('');
    this.showDropdown.set(false);
  }

  displaySelectedLabel(): string | null {
    if (!this.selectedValue) return null;
    if (typeof this.selectedValue === 'string') return this.selectedValue;
    if (
      typeof this.selectedValue === 'object' &&
      this.displayKey in this.selectedValue
    )
      return (this.selectedValue as any)[this.displayKey];
    return null;
  }

  clearSearch(event?: MouseEvent): void {
    event?.stopPropagation();
    this.searchTerm.set('');
  }
}
