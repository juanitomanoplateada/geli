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
  // Input properties
  @Input() columns: ColumnConfig[] = [];
  @Input() data: any[] = []; // Accepts EquipmentDto[] or similar
  @Input() checkedItems: any[] = [];

  // Output events
  @Output() checkedItemsChange = new EventEmitter<any[]>();

  /**
   * Checks if an item is in the checkedItems array
   * @param item The item to check
   * @returns boolean indicating if the item is checked
   */
  isChecked(item: any): boolean {
    return this.checkedItems.some((checkedItem) => checkedItem.id === item.id);
  }

  /**
   * Handles checkbox toggle events
   * @param item The item being toggled
   * @param event The DOM event
   */
  onCheckboxToggle(item: any, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const updatedItems = checked
      ? [...this.checkedItems, item]
      : this.checkedItems.filter((checkedItem) => checkedItem.id !== item.id);

    this.checkedItemsChange.emit(updatedItems);
  }

  /**
   * TrackBy function for ngFor optimization
   * @param _ index (unused)
   * @param item The item being tracked
   * @returns The unique identifier for the item
   */
  trackById(_: number, item: any): number {
    return item.id;
  }

  /**
   * Resolves nested object properties using dot notation
   * @param item The object containing the data
   * @param key The property path (e.g., 'property.nestedProperty')
   * @returns The resolved value or undefined
   */
  resolveNestedValue(item: any, key: string): any {
    if (!key.includes('.')) {
      return item[key];
    }

    return key.split('.').reduce((obj, currentKey) => {
      return obj?.[currentKey];
    }, item);
  }

  getStatusClass(statusValue: string): string {
    if (!statusValue) return '';
    return statusValue.toLowerCase().includes('ACTIVO')
      ? 'available'
      : 'unavailable';
  }
}
