import { Component, inject, input, output, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SelectComponent, SelectOption } from '../../../../shared/components/select/select';
import type { BookingFormValue, BookingFormInitialValue } from '../../models/booking.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarDays } from '@ng-icons/lucide';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

import { notPastDate } from 'shared';
@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.html',
  imports: [ReactiveFormsModule, NgIcon, SelectComponent, MatDatepickerModule, MatInputModule],
  providers: [provideNativeDateAdapter(), provideIcons({ lucideCalendarDays })],
})
export class BookingForm {
  private readonly formBuilder = inject(FormBuilder);

  readonly serviceOptions = input<readonly SelectOption[]>([]);
  readonly staffOptions = input<readonly SelectOption[]>([]);
  readonly isSubmitting = input(false);
  readonly submitted = output<BookingFormValue>();
  readonly minBookingDate = new Date();
  readonly form = this.formBuilder.nonNullable.group({
    customerName: ['', [Validators.required, Validators.maxLength(120)]],
    phone: ['', [Validators.required, Validators.pattern(/^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    serviceId: ['', Validators.required],
    date: this.formBuilder.control<Date | null>(null, [Validators.required, notPastDate()]),
    time: ['', Validators.required],
    staffId: ['', Validators.required],
  });
  readonly submitLabel = input('Create booking');
  readonly initialValue = input<BookingFormInitialValue | null>(null);
  onServiceChange(serviceId: string): void {
    this.form.controls.serviceId.setValue(serviceId);
    this.form.controls.serviceId.markAsTouched();
  }
  constructor() {
    effect(() => {
      const value = this.initialValue();

      if (value) {
        this.form.reset(value);
      }
    });
  }
  onStaffChange(staffId: string): void {
    this.form.controls.staffId.setValue(staffId);
    this.form.controls.staffId.markAsTouched();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (!value.date) {
      return;
    }

    this.submitted.emit({
      ...value,
      date: this.toDateParam(value.date),
    });
  }
  private toDateParam(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
