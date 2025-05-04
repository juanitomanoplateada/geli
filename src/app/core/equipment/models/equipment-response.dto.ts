export interface EquipmentDto {
  id: number;
  equipmentName: string;
  brand: {
    id: number;
    brandName: string;
  };
  inventoryNumber: string;
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
  availability: boolean;
  equipmentObservations: string;
  functions: {
    id: number;
    functionName: string;
  }[];
  authorizedUsers: {
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
    position: {
      id: number;
      name: string;
    };
    authorizedUserEquipments: {
      id: number;
      equipmentName: string;
      brand: {
        id: number;
        brandName: string;
      };
      inventoryNumber: string;
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
      availability: boolean;
      remarks: string;
      functions: {
        id: number;
        functionName: string;
      }[];
    }[];
    positionHistory: {
      oldPositionName: string;
      newPositionName: string;
      changeDate: string;
    }[];
  }[];
}
