import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';

import type {
  Booking,
  BookingListParams,
  BookingListResponse,
  BookingStatus,
} from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly bookingsUrl = environment.apiBaseUrl + '/bookings';

  list({
    page = 1,
    limit = 10,
    search,
    from,
    to,
    status,
  }: BookingListParams = {}): Observable<BookingListResponse> {
    return this.http.get<Booking[]>(this.bookingsUrl).pipe(
      map((bookings) => {
        const normalizedSearch = search?.trim().toLowerCase();

        const filteredBookings = bookings.filter((booking) => {
          const bookingDate = booking.startsAt.slice(0, 10);
          const searchableText = [
            booking.bookingReference,
            booking.type,
            booking.customer.fullName,
            booking.customer.phoneE164,
          ]
            .join(' ')
            .toLowerCase();

          return (
            (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
            (!from || bookingDate >= from) &&
            (!to || bookingDate <= to) &&
            (!status || booking.status === status)
          );
        });

        const total = filteredBookings.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const currentPage = Math.min(Math.max(page, 1), totalPages);
        const startIndex = (currentPage - 1) * limit;

        return {
          success: true,
          data: filteredBookings.slice(startIndex, startIndex + limit),
          pagination: {
            page: currentPage,
            limit,
            total,
            totalPages,
          },
        };
      }),
    );
  }

  updateStatus(bookingId: string, status: BookingStatus) {
    return this.http.put<{ success: boolean; data?: Booking }>(
      this.bookingsUrl + '/' + bookingId + '/status',
      { status },
    );
  }
}

