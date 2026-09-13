import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-input',
  templateUrl: './search.html',
})
export class SearchInputComponent {
  readonly id = input.required<string>();
  readonly label = input('');
  readonly placeholder = input('Search...');
  readonly value = input('');

  readonly valueChange = output<string>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.valueChange.emit(input.value);
  }
}
