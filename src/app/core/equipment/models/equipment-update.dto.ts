export interface EquipmentUpdateDto {
  equipmentName: string;
  brand: {
    id: number;
    brandName: string;
  };
  inventoryNumber: string;
  laboratoryId: number;
  availability: boolean;
  equipmentObservations: string;
  functions: number[];
}
