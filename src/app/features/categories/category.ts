import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';

import { CategoryFacade } from './category.facade';
import { SearchInputComponent } from '../../shared/components/search/search';
import { SelectComponent, SelectOption } from '../../shared/components/select/select';

@Component({
  selector: 'app-categories',
  imports: [SearchInputComponent, SelectComponent, RouterLink, NgIcon],
  providers: [CategoryFacade, provideIcons({ lucidePlus, lucidePencil, lucideTrash2 })],
  templateUrl: './categorie.html',
})
export class Categories {
  readonly facade = inject(CategoryFacade);

  readonly activityOptions: SelectOption[] = [
    { value: '', label: 'All categories' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Hidden' },
  ];

  readonly sortOptions: SelectOption[] = [
    { value: 'name:asc', label: 'Name: A to Z' },
    { value: 'name:desc', label: 'Name: Z to A' },
  ];

  ngOnInit(): void {
    this.facade.init();
  }

  activityValue(): string {
    const isActive = this.facade.listParams().isActive;
    return isActive === undefined ? '' : `${isActive}`;
  }
}
