import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CategoryFormValue } from '../../models/category.model';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule],
  templateUrl: './category-form.html',
})
export class CategoryForm {
  private readonly formBuilder = inject(FormBuilder);

  readonly initialValue = input<CategoryFormValue | null>(null);
  readonly isSubmitting = input(false);
  readonly submitLabel = input('Save category');

  readonly submitted = output<CategoryFormValue>();
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: ['', Validators.pattern(/^https?:\/\/.+/i)],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      const initialValue = this.initialValue();

      if (initialValue) {
        this.form.patchValue(initialValue);
        this.imagePreviewUrl.set(initialValue.imageUrl || null);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }
}
