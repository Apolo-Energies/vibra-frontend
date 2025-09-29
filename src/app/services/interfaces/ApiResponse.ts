export interface ApiResponse<T> {
  isSuccess: boolean;
  result: T;
  displayMessage: string;
  errorMessages: string[] | null;
  status: number;
}
