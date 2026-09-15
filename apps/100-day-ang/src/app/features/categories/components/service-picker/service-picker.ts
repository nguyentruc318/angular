import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import type { CategoryServiceItem } from '../../models/category.model';

@Component({
  selector: 'app-service-picker',
  templateUrl: './service-picker.html',
  imports: [CurrencyPipe],
})
export class ServicePicker {
  readonly services = input<CategoryServiceItem[]>([]);
  readonly selectedIds = input<string[]>([]);
  readonly selectionChange = output<string[]>();

  readonly searchTerm = signal('');

  readonly filteredServices = computed(() => {
    const keyword = this.searchTerm().trim().toLowerCase();

    if (!keyword) {
      return this.services();
    }

    return this.services().filter((service) => service.name.toLowerCase().includes(keyword));
  });

  readonly selectedCount = computed(() => this.selectedIds().length);

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  isSelected(serviceId: string): boolean {
    return this.selectedIds().includes(serviceId);
  }

  toggle(serviceId: string): void {
    const selected = new Set(this.selectedIds());

    if (selected.has(serviceId)) {
      selected.delete(serviceId);
    } else {
      selected.add(serviceId);
    }

    this.selectionChange.emit([...selected]);
  }
}

