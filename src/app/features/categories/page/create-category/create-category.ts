import { Component, inject } from '@angular/core';
import { CategoryForm } from '../../components/category-form/category-form';
import { CategoryFacade } from '../../category.facade';
@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.html',
  imports: [CategoryForm],
  providers: [CategoryFacade],
})
export class CreateCategory {
  readonly facade = inject(CategoryFacade);
}
