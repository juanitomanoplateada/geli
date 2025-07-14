export interface SessionRecord {
  id: number;
  equipment: string;
  lab: string;
  labName: string;
  brand: string;
  inventoryCode: string;
  date: string;
  time: string;
  verifiedStatus: string;
  usageStatus: string;
  usageDuration?: string;
  sampleCount?: number;
  functionsUsed?: string[];
  observations?: string;
  responsible: string;
  email:string;
  inProgress: boolean;
  startDateTime: string;
  endUseTime: string;
}
