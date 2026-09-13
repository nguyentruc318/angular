export interface LoginResponse {
  authenticated: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}
