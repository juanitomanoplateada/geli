import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UppercaseDirective } from '../../directives/uppercase/uppercase.directive';
import { ClickOutsideDirective } from '../../directives/click-outside/click-outside.directive';
import { FunctionDto } from '../../../core/function/services/function.service';

@Component({
  selector: 'app-tag-multiselect',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UppercaseDirective,
    ClickOutsideDirective,
  ],
  templateUrl: './tag-multiselect.component.html',
  styleUrls: ['./tag-multiselect.component.scss'],
})
export class TagMultiselectComponent {
  readonly NA_LABEL = 'N/A';
  @Input() placeholder: string = 'Seleccionar opciones';
  @Input() availableOptions: FunctionDto[] = [{ id: 0, functionName: 'N/A' }];
  @Input() selected: FunctionDto[] = [];

  @Output() selectedChange = new EventEmitter<FunctionDto[]>();

  searchTerm: string = '';
  showDropdown: boolean = false;

  get filteredOptions(): FunctionDto[] {
    const term = this.searchTerm.trim().toUpperCase();

    // Si ya está seleccionada N/A, no mostrar ninguna opción
    if (
      this.selected.some((f) => f.functionName.toUpperCase() === this.NA_LABEL)
    ) {
      return [];
    }

    return this.availableOptions.filter((opt) => {
      const name = opt?.functionName?.toUpperCase() ?? '';
      const isNA = name === this.NA_LABEL;

      // Mostrar N/A siempre que no esté seleccionada
      if (isNA) return true;

      // Mostrar las otras si coinciden con el término y no están seleccionadas
      return (
        name.includes(term) &&
        !this.selected.some((sel) => sel.functionName.toUpperCase() === name)
      );
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    this.searchTerm = '';
  }

  addOption(option: FunctionDto): void {
    // Si se selecciona N/A, reemplazar todo
    if (option.functionName.toUpperCase() === this.NA_LABEL) {
      this.selected = [option];
    } else {
      // Si ya está N/A, no se puede agregar
      if (
        this.selected.some(
          (f) => f.functionName.toUpperCase() === this.NA_LABEL
        )
      )
        return;

      this.selected = [...this.selected, option];
    }
    this.selectedChange.emit(this.selected);
    this.searchTerm = '';
    this.showDropdown = false;
  }

  addNewOption(): void {
    const newName = this.searchTerm.trim().toUpperCase();
    if (!newName || newName === this.NA_LABEL) return;

    const alreadyExistsInAvailable = this.availableOptions.some(
      (f) => f.functionName.toUpperCase() === newName
    );
    const alreadyExistsInSelected = this.selected.some(
      (f) => f.functionName.toUpperCase() === newName
    );

    if (alreadyExistsInAvailable || alreadyExistsInSelected) return;

    const newOption: FunctionDto = { id: 0, functionName: newName };
    this.availableOptions = [...this.availableOptions, newOption];
    this.addOption(newOption);
  }

  removeOption(option: FunctionDto): void {
    this.selected = this.selected.filter(
      (o) => o.functionName.toUpperCase() !== option.functionName.toUpperCase()
    );
    this.selectedChange.emit(this.selected);
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  canAddNew(): boolean {
    const term = this.searchTerm.trim().toUpperCase();

    if (term === this.NA_LABEL) return false;
    if (
      this.selected.some((f) => f.functionName.toUpperCase() === this.NA_LABEL)
    )
      return false;

    return (
      term !== '' &&
      !this.availableOptions.some(
        (opt) => opt.functionName.toUpperCase() === term
      ) &&
      !this.selected.some((sel) => sel.functionName.toUpperCase() === term)
    );
  }
}
