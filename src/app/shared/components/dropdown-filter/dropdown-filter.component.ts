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
  @Input() options: string[] = [];
  @Input() selected: string = '';
  @Input() placeholder: string = 'Seleccione...';
  @Input() allowEmpty: string = 'Todos';
  @Output() selectedChange = new EventEmitter<string>();

  showDropdown = signal(false);
  searchTerm = signal('');

  get filteredOptions(): string[] {
    return this.options.filter((opt) =>
      opt.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
  }

  toggleDropdown() {
    this.showDropdown.set(!this.showDropdown());
    this.searchTerm.set('');
  }

  select(option: string) {
    this.selectedChange.emit(option);
    this.showDropdown.set(false);
  }

  clearSelection() {
    this.selectedChange.emit('');
    this.showDropdown.set(false);
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }
}
