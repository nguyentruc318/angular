export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  authenticated: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}
