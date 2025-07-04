export interface EquipmentEndUseRequest {
  isVerified: boolean;
  isAvailable: boolean;
  samplesNumber: number;
  usedFunctions: number[];
  observations: string;
}
