export interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'status' | 'actions'; // puedes extender con otros tipos si lo necesitas (por ejemplo: 'date', 'boolean', etc.)
}
