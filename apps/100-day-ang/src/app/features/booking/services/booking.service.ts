import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import type {
  Booking,
  BookingListParams,
  BookingListResponse,
  BookingStatus,
} from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  list({ page = 1, limit = 10, search, from, to, status }: BookingListParams = {}) {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (search) {
      params = params.set('search', search);
    }

    if (from) {
      params = params.set('from', from);
    }

    if (to) {
      params = params.set('to', to);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<BookingListResponse>(`${environment.apiBaseUrl}/bookings`, { params });
  }
  updateStatus(bookingId: string, status: BookingStatus) {
    return this.http.put<{ success: boolean; data?: Booking }>(
      `${environment.apiBaseUrl}/bookings/${bookingId}/status`,
      { status },
    );
  }
}
