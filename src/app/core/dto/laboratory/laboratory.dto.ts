export interface Laboratory {
  id?: number;
  laboratoryName: string;
  laboratoryDescription: string;
  location: {
    id?: number;
    locationName: string;
  };
  laboratoryAvailability: boolean;
  laboratoryObservations?: string;
}
