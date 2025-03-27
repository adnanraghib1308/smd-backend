export interface Response<T> {
  success: boolean;
  data: T;
  error?: {
    code: number;
    message: string;
  };
}