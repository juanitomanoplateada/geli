export interface EquipmentUseResponse {
  id: number;
  isInUse: boolean;
  isVerified: boolean;
  isAvailable: boolean;
  samplesNumber: number;
  observations: string;
  useDate: string;
  startUseTime: string;
  endUseTime: string | null;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    identification: string;
  };
  equipment: {
    id: number;
    equipmentName: string;
    inventoryNumber: string;
    availability: boolean;
    equipmentObservations: string | null;
    laboratory: {
      id: number;
      laboratoryName: string;
      laboratoryDescription: string;
      location: {
        id: number;
        locationName: string;
      };
      laboratoryAvailability: boolean;
      laboratoryObservations: string;
    };
  };
  usedFunctions: {
    id: number;
    functionName: string;
  }[];
}
