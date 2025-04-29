export interface Laboratory {
  id: number;
  laboratoryName: string;
  laboratoryDescription: string;
  location: {
    id: number;
    locationName: string;
    locationType: {
      id: number;
      locationTypeName: string;
    };
    parentLocation: string;
  };
  laboratoryAvailability: boolean;
}
