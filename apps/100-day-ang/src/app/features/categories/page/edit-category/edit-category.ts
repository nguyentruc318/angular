import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, finalize, of, switchMap } from 'rxjs';
import { toast } from 'ngx-sonner';

import { CategoryForm } from '../../components/category-form/category-form';
import type {
  CategoryFormValue,
  CategoryServiceItem,
  CategoryWithServices,
  UpdateCategoryRequest,
} from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.html',
  imports: [CategoryForm, RouterLink],
})
export class EditCategory {
  readonly category = signal<CategoryWithServices | null>(null);
  readonly services = signal<CategoryServiceItem[]>([]);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly initialValue = computed<CategoryFormValue | null>(() => {
    const category = this.category();

    if (!category) {
      return null;
    }

    return {
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl ?? '',
      imageFile: null,
      isActive: category.isActive,
      serviceIds: category.services.map((service) => service.id),
    };
  });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const categoryId = params.get('categoryId');

        if (!categoryId) {
          this.errorMessage.set('Category ID is missing.');
          this.isLoading.set(false);
          return;
        }

        this.loadCategory(categoryId);
      });
  }

  updateCategory(formValue: CategoryFormValue): void {
    const category = this.category();

    if (!category) {
      return;
    }

    const payload: UpdateCategoryRequest = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      imageUrl: formValue.imageUrl.trim() || null,
      isActive: formValue.isActive,
    };

    const originalIds = new Set(category.services.map((service) => service.id));
    const selectedIds = new Set(formValue.serviceIds);
    const serviceUpdates = [
      ...[...selectedIds]
        .filter((serviceId) => !originalIds.has(serviceId))
        .map((serviceId) =>
          this.categoryService.updateServiceCategory(serviceId, category.id),
        ),
      ...[...originalIds]
        .filter((serviceId) => !selectedIds.has(serviceId))
        .map((serviceId) =>
          this.categoryService.updateServiceCategory(serviceId, null),
        ),
    ];

    this.isSaving.set(true);

    this.categoryService
      .update(category.id, payload)
      .pipe(
        switchMap(() =>
          serviceUpdates.length ? forkJoin(serviceUpdates) : of([]),
        ),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: () => {
          toast.success('Category updated');
          void this.router.navigateByUrl('/categories');
        },
        error: (error: HttpErrorResponse) => {
          toast.error(error.error?.message ?? 'Unable to update category. Please try again.');
        },
      });
  }

  private loadCategory(categoryId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      category: this.categoryService.detail(categoryId),
      services: this.categoryService.listServices(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ category, services }) => {
          this.category.set(category);
          this.services.set(services);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.error?.message ?? 'Unable to load this category. Please try again.',
          );
        },
      });
  }
}
