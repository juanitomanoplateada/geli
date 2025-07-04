export interface EquipmentFunctionsDto {
  id: number;
  equipmentName: string;
  inventoryNumber: string;
  availability: boolean;
  functions: {
    id: number;
    functionName: string;
  }[];
}
