import { EquipmentDto } from "../equipment/equipment-response.dto";
import { PositionDto } from "../position/position-response.dto";

export interface UserRecordResponse {
  id: number;
  keycloakId: string;
  firstName: string;
  lastName: string;
  email: string;
  identification: string;
  enabledStatus: boolean;
  role: string;
  modificationStatusDate: string;
  creationDate: string;
  position?: PositionDto;
  authorizedUserEquipments?: EquipmentDto[];
}
