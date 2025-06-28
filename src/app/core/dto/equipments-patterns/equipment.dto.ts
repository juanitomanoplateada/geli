export interface EquipmentDTO {
  id?: number;
  equipmentName?: string; // Nombre parcial del equipo
  inventoryNumber?: string; // Código de inventario parcial
  brandId?: number; // ID de la marca (corregido, antes 'brand' string)
  laboratoryId?: number; // ID del laboratorio
  availability?: boolean; // true / false
  functionId?: number; // Nuevo filtro: función asociada
}
