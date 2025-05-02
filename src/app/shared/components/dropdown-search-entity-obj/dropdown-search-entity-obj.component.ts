import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UppercaseDirective } from '../../directives/uppercase/uppercase.directive';
import { ClickOutsideDirective } from '../../directives/click-outside/click-outside.directive';

export interface LabeledOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-dropdown-search-entity-obj',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UppercaseDirective,
    ClickOutsideDirective,
  ],
  templateUrl: './dropdown-search-entity-obj.component.html',
  styleUrls: ['./dropdown-search-entity-obj.component.scss'],
})
export class DropdownSearchEntityObjComponent {
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() options: LabeledOption[] = [];
  private _selectedValue: string | null = null;
  @Input()
  set selectedValue(value: string | null) {
    this._selectedValue = value;
  }
  get selectedValue(): string | null {
    return this._selectedValue;
  }

  @Input() disabled: boolean = false;
  @Output() select = new EventEmitter<string>();

  showDropdown = signal(false);
  searchTerm = signal('');

  getFilteredOptions(): LabeledOption[] {
    return this.options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(this.searchTerm().toLowerCase()) &&
        opt.value !== this.selectedValue
    );
  }

  getSelectedLabel(): string | null {
    const selected = this.options.find((o) => o.value === this.selectedValue);
    return selected ? selected.label : null;
  }

  toggleDropdown(): void {
    if (!this.disabled) this.showDropdown.set(!this.showDropdown());
  }

  onSelect(option: LabeledOption): void {
    this._selectedValue = option.value;
    this.select.emit(option.value);
    this.searchTerm.set('');
    this.showDropdown.set(false);
  }

  close(): void {
    this.showDropdown.set(false);
  }
}
