export interface ErrorResponse {
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
  details?: any;
}
