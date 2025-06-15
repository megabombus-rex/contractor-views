interface Result<T> {
  isSuccess: boolean;
  value?: T;
  errorMessage?: string;
  errorCode?: number;
}
