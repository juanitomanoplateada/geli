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
  selector: 'app-dropdown-search',
  standalone: true,
  imports: [CommonModule, FormsModule, UppercaseDirective, ClickOutsideDirective],
  templateUrl: './dropdown-search.component.html',
  styleUrls: ['./dropdown-search.component.scss'],
})
export class DropdownSearchComponent {
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() options: string[] = [];
  @Input() selectedValue: string | null = null;
  @Input() disabled: boolean = false;

  @Output() select = new EventEmitter<string>();

  showDropdown = signal(false);
  searchTerm = signal('');

  get filteredOptions(): string[] {
    return this.options.filter(
      (opt) =>
        opt.toLowerCase().includes(this.searchTerm().toLowerCase()) &&
        opt !== this.selectedValue
    );
  }

  toggleDropdown(): void {
    if (!this.disabled) this.showDropdown.set(!this.showDropdown());
  }

  onSelect(option: string): void {
    this.select.emit(option);
    this.searchTerm.set('');
    this.showDropdown.set(false);
  }

  close(): void {
    this.showDropdown.set(false);
  }
}
