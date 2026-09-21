import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePencil,
  lucidePlus,
  lucideTrash2,
  lucideFilter,
  lucideArrowUpDown,
} from '@ng-icons/lucide';
import { DateFilterComponent, Modal, SheetDialog } from 'shared';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { SearchInputComponent } from '../../shared/components/search/search';
import {
  BOOKING_STATUSES,
  type Booking as BookingItem,
  type BookingStatus,
} from './models/booking.model';
import { BookingFacade } from './booking.facade';
import { BookingForm } from './components/booking-form/booking-form';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { HasPermissionDirective } from '../../core/authorization/has-permission.directive';
@Component({
  selector: 'app-booking',
  templateUrl: './booking.html',
  imports: [
    PaginationComponent,
    SearchInputComponent,
    DatePipe,
    SheetDialog,
    DateFilterComponent,
    NgIcon,
    MatMenuModule,
    Modal,
    BookingForm,
    MatMenuTrigger,
    HasPermissionDirective,
    MatCheckboxModule,
  ],
  providers: [
    BookingFacade,
    provideIcons({ lucidePlus, lucidePencil, lucideTrash2, lucideFilter, lucideArrowUpDown }),
  ],
})
export class Booking implements OnInit {
  readonly facade = inject(BookingFacade);
  readonly bookingToDelete = signal<BookingItem | null>(null);
  readonly bookingStatuses = BOOKING_STATUSES;
  readonly draftStatuses = signal<BookingStatus[]>([]);
  ngOnInit(): void {
    this.facade.init();
  }

  openDeleteModal(booking: BookingItem): void {
    this.bookingToDelete.set(booking);
  }

  closeDeleteModal(): void {
    if (!this.facade.isBookingDeleting()) {
      this.bookingToDelete.set(null);
    }
  }

  confirmDelete(): void {
    const booking = this.bookingToDelete();

    if (!booking) {
      return;
    }

    this.facade.removeBooking(booking);
    this.bookingToDelete.set(null);
  }

  syncDraftStatuses(): void {
    this.draftStatuses.set([...this.facade.statuses()]);
  }

  toggleStatus(status: BookingStatus, checked: boolean): void {
    this.draftStatuses.update((selected) => {
      if (checked) {
        return selected.includes(status) ? selected : [...selected, status];
      }

      return selected.filter((item) => item !== status);
    });
  }

  clearDraftStatuses(): void {
    this.draftStatuses.set([]);
  }

  applyStatusFilters(menuTrigger: MatMenuTrigger): void {
    this.facade.updateStatusFilter(this.draftStatuses());
    menuTrigger.closeMenu();
  }
}
