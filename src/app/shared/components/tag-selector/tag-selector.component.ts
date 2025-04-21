import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UppercaseDirective } from '../../directives/uppercase/uppercase.directive';
import { ClickOutsideDirective } from '../../directives/click-outside/click-outside.directive';

@Component({
  selector: 'app-tag-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UppercaseDirective,
    ClickOutsideDirective,
  ],
  templateUrl: './tag-selector.component.html',
  styleUrls: ['./tag-selector.component.scss'],
})
export class TagSelectorComponent {
  @Input() placeholder: string = 'Seleccionar funciones';
  @Input() availableOptions: string[] = [];
  @Input() selected: string[] = [];

  @Output() selectedChange = new EventEmitter<string[]>();

  searchTerm = '';
  showDropdown = false;

  get filteredOptions(): string[] {
    return this.availableOptions.filter(
      (opt) =>
        opt.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
        !this.selected.includes(opt)
    );
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    this.searchTerm = '';
  }

  addOption(option: string) {
    this.selected.push(option);
    this.selectedChange.emit(this.selected);
    this.searchTerm = '';
    this.showDropdown = false;
  }

  removeOption(option: string) {
    this.selected = this.selected.filter((opt) => opt !== option);
    this.selectedChange.emit(this.selected);
  }

  closeDropdown() {
    this.showDropdown = false;
  }
}
