import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { ManagementService, ServiceFormValue } from '../models/services.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select';
@Component({
  selector: 'app-form-service',
  templateUrl: './form-service.html',
  imports: [ReactiveFormsModule, SelectComponent],
})
export class FormService {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly service = input<ManagementService | null>(null);
  readonly categoryOptions = input<readonly SelectOption[]>([]);
  readonly initialValue = computed<ServiceFormValue | null>(() => {
    const service = this.service();

    if (!service) {
      return null;
    }

    return {
      name: service.name,
      categoryId: service.categoryId ?? '',
      price: String((service.priceMinor ?? 0) / 100),
      durationMinutes: service.durationMinutes ?? 0,
      description: service.description ?? '',
      status: service.status,
      isPopular: service.isPopular,
      imageFile: null,
    };
  });
  readonly isSubmitting = input(false);
  readonly submitLabel = input('Save changes');
  readonly imagePreviewUrl = signal<string | null>(null);

  readonly submitted = output<ServiceFormValue>();
  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    categoryId: this.fb.nonNullable.control('', Validators.required),
    price: this.fb.nonNullable.control('', Validators.required),
    durationMinutes: this.fb.nonNullable.control(0, Validators.min(1)),
    description: this.fb.nonNullable.control(''),
    status: this.fb.nonNullable.control(false),
    isPopular: this.fb.nonNullable.control(false),
    imageFile: this.fb.control<File | null>(null),
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      const previewUrl = this.imagePreviewUrl();

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    });

    effect(() => {
      const initialValue = this.initialValue();

      if (initialValue) {
        this.form.patchValue(initialValue);
      }
    });
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    const previousPreviewUrl = this.imagePreviewUrl();
    if (previousPreviewUrl) {
      URL.revokeObjectURL(previousPreviewUrl);
    }

    this.form.controls.imageFile.setValue(file);
    this.form.controls.imageFile.markAsDirty();
    this.imagePreviewUrl.set(file ? URL.createObjectURL(file) : null);
  }
  onCategoryChange(categoryId: string): void {
    this.form.controls.categoryId.setValue(categoryId);
    this.form.controls.categoryId.markAsTouched();
    this.form.controls.categoryId.markAsDirty();
  }
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }
}
