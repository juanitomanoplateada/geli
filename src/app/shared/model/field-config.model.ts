export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'dropdown';
  options?: string[] | { label: string; value: any }[]; // ← permite ambos tipos
  placeholder?: string;
  allowEmptyOption?: string;
}
