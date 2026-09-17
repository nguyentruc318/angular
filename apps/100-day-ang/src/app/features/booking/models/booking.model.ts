export const BOOKING_STATUSES = ['pending_confirmation', 'confirmed', 'checked_out'] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface BookingCustomer {
  id: string;
  fullName: string;
  phoneE164: string;
  email?: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  serviceId?: string;
  staffId?: string;
  status: BookingStatus;
  createdAt?: string;
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

export interface BookingFormValue {
  customerName: string;
  phone: string;
  email: string;
  serviceId: string;
  date: string;
  time: string;
  staffId: string;
}
export type BookingFormInitialValue = Omit<BookingFormValue, 'date'> & {
  date: Date | null;
};
