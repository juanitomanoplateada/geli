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
  @Input() availableOptions: any[] = [];
  @Input() selected: any[] = [];
  @Input() labelField: string = 'functionName'; // para mostrar
  @Input() valueField: string = 'id'; // para comparación

  @Output() selectedChange = new EventEmitter<any[]>();

  searchTerm = '';
  showDropdown = false;

  get filteredOptions(): any[] {
    return this.availableOptions.filter((opt) => {
      const label = opt?.[this.labelField];
      return (
        typeof label === 'string' &&
        label.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
        !this.selected.some(
          (s) => s?.[this.valueField] === opt?.[this.valueField]
        )
      );
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    this.searchTerm = '';
  }

  addOption(option: any) {
    this.selected.push(option);
    this.selectedChange.emit(this.selected);
    this.searchTerm = '';
    this.showDropdown = false;
  }

  removeOption(option: any) {
    this.selected = this.selected.filter(
      (s) => s?.[this.valueField] !== option?.[this.valueField]
    );
    this.selectedChange.emit(this.selected);
  }

  closeDropdown() {
    this.showDropdown = false;
  }
}
