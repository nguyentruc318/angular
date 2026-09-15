import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleComponent, Modal } from 'shared';
import { CategoryFormValue, CategoryServiceItem } from '../../models/category.model';
import { ServicePicker } from '../service-picker/service-picker';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, ToggleComponent, Modal, ServicePicker],
  templateUrl: './category-form.html',
})
export class CategoryForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly initialValue = input<CategoryFormValue | null>(null);
  readonly isSubmitting = input(false);
  readonly submitLabel = input('Save category');
  readonly services = input<CategoryServiceItem[]>([]);
  readonly isServiceModalOpen = signal(false);
  readonly selectedServiceIds = signal<string[]>([]);
  readonly draftServiceIds = signal<string[]>([]);
  readonly submitted = output<CategoryFormValue>();
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: [''],
    imageFile: this.formBuilder.control<File | null>(null),
    isActive: [true],
    serviceIds: this.formBuilder.nonNullable.control<string[]>([]),
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
        this.selectedServiceIds.set([...(initialValue.serviceIds ?? [])]);
        this.imagePreviewUrl.set(initialValue.imageUrl || null);
      }
    });
  }
  openServiceModal(): void {
    this.draftServiceIds.set([...this.selectedServiceIds()]);
    this.isServiceModalOpen.set(true);
  }

  closeServiceModal(): void {
    this.isServiceModalOpen.set(false);
  }

  onServiceSelectionChange(ids: string[]): void {
    this.draftServiceIds.set(ids);
  }

  confirmServices(): void {
    const ids = [...this.draftServiceIds()];

    this.selectedServiceIds.set(ids);
    this.form.controls.serviceIds.setValue(ids);
    this.closeServiceModal();
  }

  removeService(serviceId: string): void {
    const ids = this.selectedServiceIds().filter((id) => id !== serviceId);

    this.selectedServiceIds.set(ids);
    this.form.controls.serviceIds.setValue(ids);
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
    this.form.controls.serviceIds.setValue(this.selectedServiceIds());

    if (this.selectedServiceIds().length === 0) {
      this.form.controls.serviceIds.setErrors({ required: true });
    }

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






