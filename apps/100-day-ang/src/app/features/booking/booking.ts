import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { DateFilterComponent, Modal, SheetDialog, TabsComponent } from 'shared';

import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { SearchInputComponent } from '../../shared/components/search/search';
import { SelectComponent } from '../../shared/components/select/select';
import type { Booking as BookingItem } from './models/booking.model';
import { BookingFacade } from './booking.facade';
import { BookingForm } from './components/booking-form/booking-form';
@Component({
  selector: 'app-booking',
  templateUrl: './booking.html',
  imports: [
    PaginationComponent,
    SearchInputComponent,
    DatePipe,
    SheetDialog,
    DateFilterComponent,
    SelectComponent,
    TabsComponent,
    NgIcon,
    Modal,
    BookingForm,
  ],
  providers: [BookingFacade, provideIcons({ lucidePencil, lucideTrash2 })],
})
export class Booking implements OnInit {
  readonly facade = inject(BookingFacade);
  readonly bookingToDelete = signal<BookingItem | null>(null);

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
}
