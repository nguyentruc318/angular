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
export const USER_ROLES = ['admin', 'manager', 'staff'] as const;
export type UserRole = (typeof USER_ROLES)[number];
