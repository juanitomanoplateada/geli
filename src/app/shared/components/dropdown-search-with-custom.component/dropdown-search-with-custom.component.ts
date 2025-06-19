import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dropdown-search-with-custom',
  templateUrl: './dropdown-search-with-custom.component.html',
  styleUrls: ['./dropdown-search-with-custom.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DropdownSearchWithCustomComponent {
  @Input() options: any[] = [];
  @Input() selectedOption: any = null;
  @Input() displayKey: string = 'name';
  @Input() selectPlaceholder: string = 'Seleccione una opción...';

  @Input() label: string = '';
  @Input() feedback: string = '';
  @Input() feedbackState: 'success' | 'error' | '' = '';

  @Input() searchText: string = '';
  @Output() searchTextChange = new EventEmitter<string>();
  @Output() selected = new EventEmitter<any>();

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  get filteredOptions() {
    const search = (this.searchText || '').toLowerCase();
    return this.options
      .filter((opt) => opt !== this.selectedOption)
      .filter((opt) => opt[this.displayKey]?.toLowerCase().includes(search));
  }

  get shouldShowCustomOption(): boolean {
    return this.filteredOptions.length === 0 && !!this.searchText.trim();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) this.clearFilter();
  }

  selectOption(option: any) {
    this.selectedOption = option;
    this.selected.emit(option);
    this.isOpen = false;
    this.clearFilter();
  }

  addCustomOption() {
    const customLabel = this.searchText.trim();
    const customOption = {
      id: 'custom',
      [this.displayKey]: customLabel,
      isCustom: true,
    };
    this.selectOption(customOption);
  }

  clearFilter() {
    this.searchText = '';
    this.searchTextChange.emit('');
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: EventTarget | null) {
    if (!target) return;
    if (!this.elementRef.nativeElement.contains(target as HTMLElement)) {
      this.isOpen = false;
      this.clearFilter();
    }
  }
}
