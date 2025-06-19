import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UppercaseDirective } from '../../directives/uppercase/uppercase.directive';
import { ClickOutsideDirective } from '../../directives/click-outside/click-outside.directive';

@Component({
  selector: 'app-dropdown-search-addable',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UppercaseDirective,
    ClickOutsideDirective,
  ],
  templateUrl: './dropdown-search-addable.component.html',
  styleUrls: ['./dropdown-search-addable.component.scss'],
})
export class DropdownSearchAddableComponent {
  @Input() placeholder = 'Seleccione una opción';
  @Input() options: string[] = [];
  @Input() selectedValue: string | null = null;
  @Input() disabled = false;

  @Output() select = new EventEmitter<string>();
  @Output() addNew = new EventEmitter<string>();

  showDropdown = signal(false);
  searchTerm = signal('');

  get filteredOptions(): string[] {
    const term = this.searchTerm().toUpperCase();
    return this.options
      .map((o) => o.toUpperCase())
      .filter((opt) => opt.includes(term) && opt !== this.selectedValue);
  }

  readonly canAddNew = computed(() => {
    const term = this.searchTerm().trim().toUpperCase();
    return term !== '' && !this.options.some((o) => o.toUpperCase() === term);
  });

  toggleDropdown(): void {
    if (!this.disabled) this.showDropdown.update((v) => !v);
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value.toUpperCase());
  }

  onSelect(option: string, event?: MouseEvent): void {
    event?.stopPropagation();
    this.select.emit(option);
    this.resetDropdown();
  }

  onAddNew(event?: MouseEvent): void {
    event?.stopPropagation();
    const term = this.searchTerm().trim();
    if (!term) return;
    this.addNew.emit(term);
    this.select.emit(term);
    this.resetDropdown();
  }

  close(): void {
    this.showDropdown.set(false);
  }

  private resetDropdown(): void {
    this.searchTerm.set('');
    this.showDropdown.set(false);
  }
}
