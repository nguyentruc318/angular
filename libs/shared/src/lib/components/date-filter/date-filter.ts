import { Component, signal, output } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';

type DateFilterType = 'today' | 'range';

@Component({
  selector: 'lib-shared-date-filter',
  standalone: true,
  imports: [FormsModule, MatDatepickerModule, NgIcon],

  providers: [provideNativeDateAdapter(), provideIcons({ lucideChevronDown })],

  templateUrl: './date-filter.html',
})
export class DateFilterComponent {
  isMenuOpen = signal(false);
  selectedType = signal<DateFilterType>('today');
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  readonly rangeChange = output<{ start: Date; end: Date }>();

  private emitRange(): void {
    const start = this.startDate();
    const end = this.endDate();

    if (start && end) {
      this.rangeChange.emit({ start, end });
    }
  }

  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  selectToday(): void {
    this.selectedType.set('today');

    const today = new Date();

    this.startDate.set(today);
    this.endDate.set(today);
    this.emitRange();
    this.isMenuOpen.set(false);
  }

  selectRange(): void {
    this.selectedType.set('range');
    this.isMenuOpen.set(false);
  }

  onStartDateChange(date: Date | null): void {
    this.startDate.set(date);
  }
  onEndDateChange(date: Date | null): void {
    this.endDate.set(date);
    this.emitRange();
  }

  getLabel(): string {
    if (this.selectedType() === 'today') {
      return 'Today';
    }

    const start = this.startDate();
    const end = this.endDate();

    if (!start || !end) {
      return 'Date range';
    }

    return `${this.formatDate(start)} - ${this.formatDate(end)}`;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN').format(date);
  }
  reset(): void {
    this.startDate.set(null);
    this.endDate.set(null);
    this.selectedType.set('today');
    this.isMenuOpen.set(false);
  }
}
