export interface Customer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  phoneE164: string | null;
  createdAt?: string;
  updatedAt?: string;
  bookingCount: number;
  completedBookingCount: number;
  totalSpentMinor?: number | string;
  lastBookingAt?: string | null;
}
export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  pagination: CustomerPagination;
}
