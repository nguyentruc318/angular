import { Component, computed, input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

export type ValidationMessages = Readonly<Record<string, string>>;

@Component({
  selector: 'lib-shared-form-error',
  template: `
    @if (message(); as message) {
      <p role="alert" class="mt-1.5 text-xs text-red-600">
        {{ message }}
      </p>
    }
  `,
})
export class FormErrorComponent {
  readonly errors = input<ValidationErrors | null>(null);
  readonly show = input(false);
  readonly messages = input.required<ValidationMessages>();

  readonly message = computed(() => {
    const errors = this.errors();

    if (!this.show() || !errors) {
      return null;
    }

    const errorKey = Object.keys(errors)[0];

    return this.messages()[errorKey] ?? 'The entered value is invalid.';
  });
}
