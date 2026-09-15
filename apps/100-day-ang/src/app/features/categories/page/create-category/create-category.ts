import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryForm } from '../../components/category-form/category-form';
import { CategoryFacade } from '../../category.facade';
import { CategoryServiceItem } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.html',
  imports: [CategoryForm, RouterLink],
  providers: [CategoryFacade],
})
export class CreateCategory {
  readonly facade = inject(CategoryFacade);
  readonly services = signal<CategoryServiceItem[]>([]);
  private readonly categoryService = inject(CategoryService);
  constructor() {
    this.categoryService.listServices().subscribe({
      next: (services) => {
        this.services.set(services);
      },
    });
  }
}
