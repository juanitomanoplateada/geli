import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnConfig } from '../../model/column-config.model';

@Component({
  selector: 'app-results-table-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-table-checkbox.component.html',
  styleUrls: ['./results-table-checkbox.component.scss'],
})
export class ResultsTableCheckboxComponent {
  @Input() columns: ColumnConfig[] = [];
  @Input() data: any[] = []; // ahora acepta EquipmentDto[]
  @Input() checkedItems: any[] = [];

  @Output() checkedItemsChange = new EventEmitter<any[]>();

  isChecked(item: any): boolean {
    return this.checkedItems.some((eq) => eq.id === item.id);
  }

  onCheckboxToggle(item: any, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.checkedItemsChange.emit([...this.checkedItems, item]);
    } else {
      this.checkedItemsChange.emit(
        this.checkedItems.filter((eq) => eq.id !== item.id)
      );
    }
  }

  trackById(_: number, item: any): number {
    return item.id;
  }

  resolveNestedValue(item: any, key: string): any {
    const keys = key.split('.');
    let value = item;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  }
}
