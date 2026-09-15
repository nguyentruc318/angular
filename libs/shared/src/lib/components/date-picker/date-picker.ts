import { Component, output, signal } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'lib-shared-date-range-picker',
  standalone: true,
  templateUrl: './date-picker.html',
  imports: [MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule],
})
export class DateRangePickerComponent {
  readonly rangeChange = output<DateRangeValue>();
  readonly startDate = signal<Date | null>(null);
  readonly endDate = signal<Date | null>(null);
  onStartDateChange(value: Date | null): void {
    this.startDate.set(value);
    this.emitRange();
  }

  onEndDateChange(value: Date | null): void {
    this.endDate.set(value);
    this.emitRange();
  }

  private emitRange(): void {
    this.rangeChange.emit({
      start: this.startDate(),
      end: this.endDate(),
    });
  }
}
