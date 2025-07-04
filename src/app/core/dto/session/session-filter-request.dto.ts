export interface EquipmentUseFilterRequest {
  isInUse?: boolean | null;
  isVerified?: boolean | null;
  isAvailable?: boolean | null;
  userId?: number;
  laboratoryId?: number;
  samplesNumberFrom?: number;
  samplesNumberTo?: number;
  usedFunctionsIds?: number[];
  useDateFrom?: string;
  useDateTo?: string;
  startUseTimeFrom?: string;
  endUseTimeTo?: string;
  startTimeFrom?: string;
  endTimeTo?: string;
  equipmentName?: string;
  equipmentInventoryCode?: string;
}
