import { HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { ServicesService } from '../services/services/services.service';
import { StaffService } from '../staff/services/staff.service';
import { QueryParamsService } from '../../core/services/query-params.service';
import { SelectOption } from '../../shared/components/select/select';
import { formatLabel } from '../../shared/utils/format-label';
import { forkJoin } from 'rxjs';

import {
  BOOKING_STATUSES,
  Booking,
  BookingListParams,
  BookingPagination,
  BookingStatus,
  BookingFormValue,
  BookingFormInitialValue,
} from './models/booking.model';
import { BookingService } from './services/booking.service';
import { TabOption } from 'shared';
import { toast } from 'ngx-sonner';
@Injectable()
export class BookingFacade {
  private readonly bookingService = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly queryParams = inject(QueryParamsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly servicesService = inject(ServicesService);
  private readonly staffService = inject(StaffService);
  private readonly searchChanges$ = new Subject<string>();
  readonly isCreating = signal(false);
  readonly isCreateOptionsLoading = signal(false);
  readonly fromDate = signal<string | null>(null);
  readonly toDate = signal<string | null>(null);
  readonly bookings = signal<Booking[]>([]);
  readonly pagination = signal<BookingPagination | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly search = signal('');
  readonly status = signal<BookingStatus | null>(null);
  readonly updatingBookingId = signal<string | null>(null);
  readonly deletingBookingId = signal<string | null>(null);
  readonly isBookingFormOpen = signal(false);
  readonly formMode = signal<'create' | 'edit'>('create');
  readonly serviceOptions = signal<SelectOption[]>([]);
  readonly isEditLoading = signal(false);
  readonly isUpdating = signal(false);
  readonly editingBooking = signal<Booking | null>(null);
  readonly editingFormValue = computed<BookingFormInitialValue | null>(() => {
    const booking = this.editingBooking();
    return booking ? this.toFormInitialValue(booking) : null;
  });
  readonly staffOptions = signal<SelectOption[]>([]);
  readonly statusTabs: readonly TabOption[] = [
    { value: '', label: 'All statuses' },
    ...BOOKING_STATUSES.map((status) => ({
      value: status,
      label: formatLabel(status),
    })),
  ];
  readonly bookingStatusOptions: SelectOption[] = BOOKING_STATUSES.map((status) => ({
    value: status,
    label: formatLabel(status),
  }));

  init(): void {
    this.listenToQueryParams();
    this.listenToSearch();
  }

  updateSearch(value: string): void {
    this.search.set(value);
    this.searchChanges$.next(value.trim());
  }

  openCreate(): void {
    this.formMode.set('create');
    this.editingBooking.set(null);
    this.isBookingFormOpen.set(true);
    this.loadCreateOptions();
  }

  private loadCreateOptions(): void {
    this.isCreateOptionsLoading.set(true);

    forkJoin({
      services: this.servicesService.list({
        page: 1,
        limit: 100,
        status: true,
      }),
      staff: this.staffService.list({
        page: 1,
        limit: 100,
        status: 'active',
      }),
    })
      .pipe(finalize(() => this.isCreateOptionsLoading.set(false)))
      .subscribe({
        next: ({ services, staff }) => {
          this.serviceOptions.set(
            services.data.map((service) => ({
              value: service.id,
              label: service.name,
            })),
          );

          this.staffOptions.set(
            staff.data.map((member) => ({
              value: member.id,
              label: member.name,
            })),
          );
        },
        error: () => {
          toast.error('Unable to load services and staff.');
        },
      });
  }
  closeBookingForm(): void {
    this.isBookingFormOpen.set(false);
    this.editingBooking.set(null);
  }
  updateStatusFilter(value: string): void {
    void this.queryParams.merge(this.route, {
      page: 1,
      status: value || null,
    });
  }

  changePage(page: number): void {
    const pageInfo = this.pagination();

    if (!pageInfo || page < 1 || page > pageInfo.totalPages || this.isLoading()) {
      return;
    }

    void this.queryParams.merge(this.route, { page });
  }

  isBookingStatusUpdating(bookingId: string): boolean {
    return this.updatingBookingId() === bookingId;
  }

  isBookingDeleting(): boolean {
    return this.deletingBookingId() !== null;
  }

  updateBookingStatus(booking: Booking, value: string): void {
    const status = value as BookingStatus;

    if (booking.status === status) {
      return;
    }

    this.updatingBookingId.set(booking.id);

    this.bookingService
      .updateStatus(booking.id, status)
      .pipe(finalize(() => this.updatingBookingId.set(null)))
      .subscribe({
        next: () => {
          this.loadBookings({
            page: this.pagination()?.page ?? 1,
            search: this.search(),
            status: this.status() ?? undefined,
          });
        },
      });
  }

  removeBooking(booking: Booking): void {
    if (this.deletingBookingId()) {
      return;
    }

    this.deletingBookingId.set(booking.id);

    this.bookingService
      .remove(booking.id)
      .pipe(finalize(() => this.deletingBookingId.set(null)))
      .subscribe({
        next: () => {
          toast.success('Booking deleted');
          this.loadBookings({
            page: this.pagination()?.page ?? 1,
            search: this.search(),
            status: this.status() ?? undefined,
            from: this.fromDate() ?? undefined,
            to: this.toDate() ?? undefined,
          });
        },
        error: (error: HttpErrorResponse) => {
          toast.error(error.error?.message ?? 'Unable to delete booking.');
        },
      });
  }
  private listenToQueryParams(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const page = Number(params.get('page')) || 1;
      const search = params.get('search') ?? '';
      const status = params.get('status') as BookingStatus | null;
      const from = params.get('from');
      const to = params.get('to');
      this.search.set(search);
      this.status.set(status);
      this.fromDate.set(from);
      this.toDate.set(to);
      this.loadBookings({
        page,
        search,
        status: status ?? undefined,
        from: from ?? undefined,
        to: to ?? undefined,
      });
    });
  }

  private listenToSearch(): void {
    this.searchChanges$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => {
        void this.queryParams.merge(this.route, {
          page: 1,
          search: search || null,
          status: this.status(),
        });
      });
  }

  private loadBookings(params: BookingListParams): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.bookingService
      .list({ limit: 10, ...params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.bookings.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: (error: HttpErrorResponse) => {
          this.bookings.set([]);
          this.pagination.set(null);
          this.errorMessage.set(error.error?.message ?? 'Unable to load bookings.');
        },
      });
  }
  updateDateFilter(range: { start: Date; end: Date }): void {
    void this.queryParams.merge(this.route, {
      from: this.toDateParam(range.start),
      to: this.toDateParam(range.end),
      page: 1,
    });
  }
  private toDateParam(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  clearFilters(): void {
    this.updateSearch('');

    void this.queryParams.merge(this.route, {
      search: null,
      status: null,
      from: null,
      to: null,
      page: 1,
    });
  }
  createBooking(formValue: BookingFormValue): void {
    if (this.isCreating()) {
      return;
    }

    const startsAt = new Date(`${formValue.date}T${formValue.time}:00`);

    if (Number.isNaN(startsAt.getTime())) {
      toast.error('Please choose a valid date and time.');
      return;
    }

    const booking: Booking = {
      id: crypto.randomUUID(),
      bookingReference: `ATN-${Date.now().toString().slice(-6)}`,
      serviceId: formValue.serviceId,
      staffId: formValue.staffId,
      status: 'pending_confirmation',
      createdAt: new Date().toISOString(),
      startsAt: startsAt.toISOString(),
      timezone: 'America/New_York',
      customer: {
        id: crypto.randomUUID(),
        fullName: formValue.customerName.trim(),
        phoneE164: formValue.phone.trim(),
        email: formValue.email.trim().toLowerCase(),
      },
    };

    this.isCreating.set(true);

    this.bookingService
      .create(booking)
      .pipe(finalize(() => this.isCreating.set(false)))
      .subscribe({
        next: () => {
          toast.success('Booking created');
          this.closeBookingForm();

          this.loadBookings({
            page: this.pagination()?.page ?? 1,
            search: this.search(),
            status: this.status() ?? undefined,
            from: this.fromDate() ?? undefined,
            to: this.toDate() ?? undefined,
          });
        },
        error: (error: HttpErrorResponse) => {
          toast.error(error.error?.message ?? 'Unable to create booking.');
        },
      });
  }
  saveBooking(formValue: BookingFormValue): void {
    if (this.formMode() === 'edit') {
      this.updateBooking(formValue);
      return;
    }

    this.createBooking(formValue);
  }

  private updateBooking(formValue: BookingFormValue): void {
    const booking = this.editingBooking();

    if (!booking || this.isUpdating()) {
      return;
    }

    const startsAt = new Date(`${formValue.date}T${formValue.time}:00`);

    if (Number.isNaN(startsAt.getTime())) {
      toast.error('Please choose a valid date and time.');
      return;
    }

    const updatedBooking: Booking = {
      ...booking,
      serviceId: formValue.serviceId,
      staffId: formValue.staffId,
      startsAt: startsAt.toISOString(),
      customer: {
        ...booking.customer,
        fullName: formValue.customerName.trim(),
        phoneE164: formValue.phone.trim(),
        email: formValue.email.trim().toLowerCase(),
      },
    };

    this.isUpdating.set(true);

    this.bookingService
      .update(updatedBooking)
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: () => {
          toast.success('Booking updated');
          this.closeBookingForm();
          this.loadBookings({
            page: this.pagination()?.page ?? 1,
            search: this.search(),
            status: this.status() ?? undefined,
            from: this.fromDate() ?? undefined,
            to: this.toDate() ?? undefined,
          });
        },
        error: (error: HttpErrorResponse) => {
          toast.error(error.error?.message ?? 'Unable to update booking.');
        },
      });
  }
  openEdit(bookingId: string): void {
    this.isBookingFormOpen.set(true);
    this.formMode.set('edit');
    this.isEditLoading.set(true);
    this.editingBooking.set(null);
    this.loadCreateOptions();
    this.bookingService
      .detail(bookingId)
      .pipe(finalize(() => this.isEditLoading.set(false)))
      .subscribe({
        next: (booking) => {
          this.editingBooking.set(booking);
        },
        error: (error: HttpErrorResponse) => {
          this.closeBookingForm();
          toast.error(error.error?.message ?? 'Unable to load booking.');
        },
      });
  }
  private toFormInitialValue(booking: Booking): BookingFormInitialValue {
    const startsAt = new Date(booking.startsAt);

    return {
      customerName: booking.customer.fullName,
      phone: booking.customer.phoneE164,
      email: booking.customer.email ?? '',
      serviceId: booking.serviceId ?? '',
      staffId: booking.staffId ?? '',
      date: startsAt,
      time: `${String(startsAt.getHours()).padStart(2, '0')}:${String(
        startsAt.getMinutes(),
      ).padStart(2, '0')}`,
    };
  }
}
