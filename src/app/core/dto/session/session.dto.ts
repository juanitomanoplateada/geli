export interface Session {
  id: number;
  equipmentId: string;
  lab: string;
  labLocation: string;
  labLabel: string;
  equipment: string;
  equipmentInventoryNumber: string;
  equipmentLabel: string;
  useDate: string;
  startUseTime: string;
  checkIn: {
    date: string;
    time: string;
    user: string;
  };
  checkOut: {
    verifiedStatus: string;
    usageStatus: string;
    usageDuration: string;
    sampleCount: number | null;
    selectedFunctions: any[];
    remarks: string;
  };
  availableFunctions: any[];
}
