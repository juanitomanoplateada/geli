import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnConfig } from '../../model/column-config.model';


interface EquipmentRecord {
  id: number;
  name: string;
  function: string;
  laboratory: string;
  availability: string;
  brand: string;
  inventoryCode: string;
  [key: string]: any; // ✅ esto habilita el acceso dinámico
}

@Component({
  selector: 'app-results-table-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-table-checkbox.component.html',
  styleUrls: ['./results-table-checkbox.component.scss'],
})
export class ResultsTableCheckboxComponent {
  @Input() columns: ColumnConfig[] = [];
  @Input() data: EquipmentRecord[] = [];
  @Input() checkedItems: EquipmentRecord[] = [];

  @Output() checkedItemsChange = new EventEmitter<EquipmentRecord[]>();

  isChecked(item: EquipmentRecord): boolean {
    return this.checkedItems.some((eq) => eq.id === item.id);
  }

  onCheckboxToggle(item: EquipmentRecord, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.checkedItemsChange.emit([...this.checkedItems, item]);
    } else {
      this.checkedItemsChange.emit(
        this.checkedItems.filter((eq) => eq.id !== item.id)
      );
    }
  }

  trackById(_: number, item: EquipmentRecord) {
    return item.id;
  }
}
