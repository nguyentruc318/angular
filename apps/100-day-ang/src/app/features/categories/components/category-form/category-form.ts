import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleComponent } from 'shared';
import { CategoryFormValue } from '../../models/category.model';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, ToggleComponent],
  templateUrl: './category-form.html',
})
export class CategoryForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly initialValue = input<CategoryFormValue | null>(null);
  readonly isSubmitting = input(false);
  readonly submitLabel = input('Save category');

  readonly submitted = output<CategoryFormValue>();
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: [''],
    imageFile: this.formBuilder.control<File | null>(null),
    isActive: [true],
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      const previewUrl = this.imagePreviewUrl();

      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    });

    effect(() => {
      const initialValue = this.initialValue();

      if (initialValue) {
        this.form.patchValue(initialValue);
        this.imagePreviewUrl.set(initialValue.imageUrl || null);
      }
    });
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file && !file.type.startsWith('image/')) {
      input.value = '';
      this.form.controls.imageFile.setValue(null);
      return;
    }

    const previousPreviewUrl = this.imagePreviewUrl();

    if (previousPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previousPreviewUrl);
    }

    this.form.controls.imageFile.setValue(file);
    this.form.controls.imageFile.markAsDirty();
    this.imagePreviewUrl.set(file ? URL.createObjectURL(file) : null);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (value.imageFile) {
      value.imageUrl = await this.readFileAsDataUrl(value.imageFile);
    }

    this.submitted.emit(value);
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
