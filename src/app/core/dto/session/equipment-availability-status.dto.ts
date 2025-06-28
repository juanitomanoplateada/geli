export interface EquipmentAvailabilityStatusDto {
  status: 'AVAILABLE' | 'IN_USE_BY_YOU' | 'IN_USE_BY_ANOTHER';
  message: string;
}
