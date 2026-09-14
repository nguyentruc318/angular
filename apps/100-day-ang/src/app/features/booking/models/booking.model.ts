export const BOOKING_STATUSES = ['pending_confirmation', 'confirmed', 'checked_out'] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface BookingCustomer {
  id: string;
  fullName: string;
  phoneE164: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  type: string;
  status: BookingStatus;
  startsAt: string;
  timezone: string;
  customer: BookingCustomer;
}

export interface BookingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BookingListParams {
  page?: number;
  limit?: number;
  search?: string;
  from?: string;
  to?: string;
  status?: BookingStatus;
}

export interface BookingListResponse {
  success: boolean;
  data: Booking[];
  pagination: BookingPagination;
}
