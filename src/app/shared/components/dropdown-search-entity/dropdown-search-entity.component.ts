import {
  Component,
  EventEmitter,
  Input,
  Output,
  Signal,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UppercaseDirective } from '../../directives/uppercase/uppercase.directive';
import { ClickOutsideDirective } from '../../directives/click-outside/click-outside.directive';

@Component({
  selector: 'app-dropdown-search-entity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UppercaseDirective,
    ClickOutsideDirective,
  ],
  templateUrl: './dropdown-search-entity.component.html',
  styleUrls: ['./dropdown-search-entity.component.scss'],
})
export class DropdownSearchEntityComponent<T = any> {
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() options: { label: string; value: T }[] = [];
  @Input() selectedValue: T | null = null;
  @Input() disabled = false;

  @Output() select = new EventEmitter<T>();
  @Output() addNew = new EventEmitter<string>();

  showDropdown = signal(false);
  searchTerm = signal('');

  get filteredOptions(): { label: string; value: T }[] {
    const term = this.searchTerm().toUpperCase();

    return this.options.filter((opt) => {
      const labelMatches = opt.label.toUpperCase().includes(term);

      // Excluir opción ya seleccionada visualmente
      const isSameAsSelected =
        (typeof this.selectedValue === 'string' &&
          opt.label.toUpperCase() === this.selectedValue.toUpperCase()) ||
        (typeof this.selectedValue === 'object' &&
          this.selectedValue !== null &&
          'locationName' in this.selectedValue &&
          opt.label.toUpperCase() ===
            (this.selectedValue as any).locationName.toUpperCase());

      return labelMatches && !isSameAsSelected;
    });
  }

  readonly canAddNew = computed(() => {
    const term = this.searchTerm().trim().toUpperCase();
    return (
      term !== '' && !this.options.some((o) => o.label.toUpperCase() === term)
    );
  });

  toggleDropdown(): void {
    if (!this.disabled) {
      this.showDropdown.update((v) => !v);
    }
  }

  onSelect(option: { label: string; value: T }): void {
    this.select.emit(option.value);
    this.resetDropdown();
  }

  onAddNew(): void {
    const term = this.searchTerm().trim();
    if (!term) return;
    this.addNew.emit(term);
    this.resetDropdown();
  }

  close(): void {
    this.showDropdown.set(false);
  }

  private resetDropdown() {
    this.searchTerm.set('');
    this.showDropdown.set(false);
  }

  displaySelectedLabel(): string | null {
    if (!this.selectedValue) return null;

    if (typeof this.selectedValue === 'string') {
      return this.selectedValue;
    }

    if (
      typeof this.selectedValue === 'object' &&
      this.selectedValue !== null &&
      'locationName' in this.selectedValue
    ) {
      return (this.selectedValue as any).locationName;
    }

    return null;
  }
}
