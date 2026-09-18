import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { DateFilterComponent, Modal, SheetDialog, TabsComponent } from 'shared';
import { MatMenuModule } from '@angular/material/menu';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { SearchInputComponent } from '../../shared/components/search/search';
import type { Booking as BookingItem } from './models/booking.model';
import { BookingFacade } from './booking.facade';
import { BookingForm } from './components/booking-form/booking-form';
import { hasPermission, Permission } from '../../core/authorization/access-control';
import { AuthStore } from '../auth/store/auth.store';
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
    TabsComponent,
    NgIcon,
    MatMenuModule,
    Modal,
    BookingForm,
    HasPermissionDirective,
  ],
  providers: [BookingFacade, provideIcons({ lucidePlus, lucidePencil, lucideTrash2 })],
})
export class Booking implements OnInit {
  readonly facade = inject(BookingFacade);
  readonly bookingToDelete = signal<BookingItem | null>(null);
  // private readonly authStore = inject(AuthStore);

  // readonly can = (permission: Permission): boolean =>
  //   hasPermission(this.authStore.user()?.role, permission);
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
