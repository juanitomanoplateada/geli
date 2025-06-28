import { FieldConfig } from '../../../../shared/model/field-config.model';

export const EQUIPMENT_USE_FIELDS_CONFIG: FieldConfig[] = [
  {
    key: 'sessionStatus',
    label: 'Estado de la sesión',
    type: 'select',
    options: ['EN CURSO', 'FINALIZADA'],
    allowEmptyOption: 'TODAS',
  },
  {
    key: 'equipment',
    label: 'Nombre del equipo/patrón',
    type: 'dropdown',
    allowEmptyOption: 'TODOS',
  },
  {
    key: 'lab',
    label: 'Ubicación',
    type: 'dropdown',
    allowEmptyOption: 'TODOS',
  },
  {
    key: 'codeInventory',
    label: 'Código inventario',
    type: 'dropdown',
    allowEmptyOption: 'TODOS',
  },
  {
    key: 'dateFrom',
    label: 'Fecha desde',
    type: 'date',
    placeholder: 'YYYY-MM-DD',
  },
  {
    key: 'dateTo',
    label: 'Fecha hasta',
    type: 'date',
    placeholder: 'YYYY-MM-DD',
  },
  {
    key: 'timeFrom',
    label: 'Hora desde',
    type: 'time',
    placeholder: 'HH:mm:ss',
  },
  {
    key: 'timeTo',
    label: 'Hora hasta',
    type: 'time',
    placeholder: 'HH:mm:ss',
  },
  {
    key: 'verifiedStatus',
    label: 'Estado - Verificado',
    type: 'select',
    options: ['SI', 'NO'],
    allowEmptyOption: 'TODOS',
  },
  {
    key: 'usageStatus',
    label: 'Estado - Para uso',
    type: 'select',
    options: ['SI', 'NO'],
    allowEmptyOption: 'TODOS',
  },
  {
    key: 'sampleCountMin',
    label: 'Cantidad de muestras analizadas',
    type: 'number',
    placeholder: 'Desde',
  },
  {
    key: 'sampleCountMax',
    label: 'Cantidad de muestras analizadas',
    type: 'number',
    placeholder: 'Hasta',
  },
  {
    key: 'function',
    label: 'Función utilizada',
    type: 'dropdown',
    allowEmptyOption: 'TODAS',
  },
];
