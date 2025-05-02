import { BrandDto } from '../../brand/services/brand.service';

export interface EquipmentCreateUpdateDto {
  id?: number;
  equipmentName: string;
  brand: BrandDto;
  inventoryNumber: string;
  laboratoryId: number;
  availability: boolean;
  equipmentObservations: string;
  authorizedUsersIds: number[];
  functions: number[];
}

export interface EquipmentFilterDto {
  equipmentName?: string; // Nombre parcial del equipo
  inventoryNumber?: string; // Código de inventario parcial
  brandId?: number; // ID de la marca (corregido, antes 'brand' string)
  laboratoryId?: number; // ID del laboratorio
  availability?: boolean; // true / false
  functionId?: number; // Nuevo filtro: función asociada
}
