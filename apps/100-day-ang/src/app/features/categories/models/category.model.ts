export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
}

export type CreateCategoryRequest = Omit<Category, 'id' | 'slug'>;

export type UpdateCategoryRequest = Partial<Omit<Category, 'id'>>;

export type CategoryListResponse = Category[];

export type CategoryDetailResponse = Category;

export type CreateCategoryResponse = Category;

export type UpdateCategoryResponse = Category;

export interface CategoryServiceItem {
  id: string;
  name: string;
  categoryId: string | null;
  priceMinor: number;
  currency: string;
  durationMinutes: number;
  isActive: boolean;
}

export interface CategoryWithServices extends Category {
  services: CategoryServiceItem[];
}

export type CategorySortBy = 'name';

export type SortDirection = 'asc' | 'desc';

export interface CategoryListParams {
  page?: number;
  perPage?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: CategorySortBy;
  direction?: SortDirection;
}

export interface CategoryPagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface CategoryListResult {
  data: CategoryWithServices[];
  pagination: CategoryPagination;
}

export interface JsonServerPageResponse<T> {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: T[];
}

export interface CategoryFormValue {
  name: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
  isActive: boolean;
  serviceIds: string[];
}

