import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  templateUrl: './select.html',
})
export class SelectComponent {
  private readonly elementRef = inject(ElementRef);

  readonly id = input.required<string>();
  readonly label = input('');
  readonly placeholder = input('Select an option');
  readonly options = input.required<readonly SelectOption[]>();
  readonly value = input('');
  readonly disabled = input(false);
  readonly containerClass = input('min-w-sm');
  readonly valueChange = output<string>();

  readonly isOpen = signal(false);

  readonly selectedOption = computed(() =>
    this.options().find((option) => option.value === this.value()),
  );

  toggle(): void {
    if (!this.disabled()) {
      this.isOpen.update((open) => !open);
    }
  }

  select(option: SelectOption): void {
    this.valueChange.emit(option.value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  closeWhenClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.isOpen.set(false);
  }
}
