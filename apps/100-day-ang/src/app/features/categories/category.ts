import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucidePlus, lucideTrash2, lucideSlidersHorizontal } from '@ng-icons/lucide';

import { CategoryFacade } from './category.facade';
import { SearchInputComponent } from '../../shared/components/search/search';
import { SelectComponent, SelectOption } from '../../shared/components/select/select';
import { CategoryWithServices } from './models/category.model';
import { Modal, TabOption, TabsComponent } from 'shared';

@Component({
  selector: 'app-categories',
  imports: [SearchInputComponent, SelectComponent, RouterLink, NgIcon, Modal, TabsComponent],
  providers: [
    CategoryFacade,
    provideIcons({ lucidePlus, lucidePencil, lucideTrash2, lucideSlidersHorizontal }),
  ],
  templateUrl: './categorie.html',
})
export class Categories {
  readonly facade = inject(CategoryFacade);

  readonly statusTabs: readonly TabOption[] = [
    { value: '', label: 'All categories' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Hidden' },
  ] as const;
  readonly isDeleteModalOpen = signal(false);
  readonly categoryToDelete = signal<CategoryWithServices | null>(null);
  readonly isFilterOpen = signal(false);
  readonly sortOptions: SelectOption[] = [
    { value: 'name:asc', label: 'Name: A to Z' },
    { value: 'name:desc', label: 'Name: Z to A' },
  ];

  ngOnInit(): void {
    this.facade.init();
  }
  toggleFilter(): void {
    this.isFilterOpen.update((isOpen) => !isOpen);
  }

  openDeleteModal(category: CategoryWithServices): void {
    this.categoryToDelete.set(category);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.categoryToDelete.set(null);
  }
  confirmDelete(): void {
    const category = this.categoryToDelete();

    if (!category) {
      return;
    }

    this.facade.removeCategory(category);
    this.closeDeleteModal();
  }
}
