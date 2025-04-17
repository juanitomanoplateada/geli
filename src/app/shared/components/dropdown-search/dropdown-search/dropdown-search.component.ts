import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dropdown-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown-search.component.html',
  styleUrls: ['./dropdown-search.component.scss'],
})
export class DropdownSearchComponent {
  @Input() items: any[] = [];
  @Input() displayField: string = 'name';
  @Input() label: string = 'Seleccione';
  @Input() placeholder: string = 'Buscar...';

  @Output() selection = new EventEmitter<any>();

  dropdownOpen = false;
  searchTerm = '';
  filteredItems: any[] = [];
  selectedLabel = 'Seleccione';

  ngOnInit(): void {
    this.filteredItems = this.items;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
    this.filteredItems = this.items;
    this.searchTerm = '';
  }

  filter(term: string): void {
    const search = term.toLowerCase();
    this.filteredItems = this.items.filter((item) =>
      item[this.displayField]?.toLowerCase().includes(search)
    );
  }

  selectItem(item: any): void {
    this.selectedLabel = item[this.displayField];
    this.selection.emit(item);
    this.dropdownOpen = false;
  }
}
