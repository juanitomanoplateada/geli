export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'dropdown';
  options?: string[];
  placeholder?: string;
  allowEmptyOption?: string;
}
