export interface ManagementBranchService {
  id: string;
  status: string;
  branchId: string;
  currency: string;
  priceMinor: number;
  depositMinor: number;
  maxAdvanceDays: number | null;
  minLeadMinutes: number | null;
  durationMinutes: number;
  bufferAfterMinutes: number;
  bufferBeforeMinutes: number;
  onlineBookingEnabled: boolean;
  bookingDurationMinutes: number;
}

export interface ManagementService {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  isAddon: boolean;
  isPopular: boolean;
  requiresConsent: boolean;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  imageUrl: string | null;
  imageAssetId: string | null;
  imageAltText: string | null;
  priceMinor: number;
  durationMinutes: number;
  status: boolean;
  sortOrder: number;
}

/**
 * Compatibility shape for the current backend response.
 * The UI uses the flat price/duration fields from ManagementService.
 */
export type ManagementServiceApi = Omit<ManagementService, 'priceMinor' | 'durationMinutes'> & {
  priceMinor?: number | null;
  durationMinutes?: number | null;
  branchServices?: ManagementBranchService[];
};

export interface JsonServerPageResponse<T> {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: T[];
}
export interface ServicePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ServiceListParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  status?: boolean;
  isPopular?: boolean;
}

export interface ServiceListResponse<T = ManagementService> {
  success: boolean;
  data: T[];
  pagination: ServicePagination;
}

export interface ServiceDetailResponse<T = ManagementService> {
  success: boolean;
  data: T;
}

export interface UpdateServicePayload {
  categoryId: string | null;
  name: string;
  description?: string;
  priceMinor: number;
  durationMinutes: number;
  status: boolean;
  isPopular: boolean;
  file?: File;
}

export interface ServiceFormValue {
  name: string;
  categoryId: string;
  price: string;
  durationMinutes: number;
  description: string;
  status: boolean;
  isPopular: boolean;
  imageFile: File | null;
}

export type CreateServicePayload = Omit<UpdateServicePayload, 'file'> & {
  file: File;
};



