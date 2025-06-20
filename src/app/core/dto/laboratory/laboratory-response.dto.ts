import { LocationDto } from "../location/location-response.dto";

export interface LaboratoryResponseDto {
  id?: number;
  laboratoryName: string;
  laboratoryDescription: string;
  location: LocationDto;
  laboratoryAvailability: boolean;
  laboratoryObservations?: string;
}
