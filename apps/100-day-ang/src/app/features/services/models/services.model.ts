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
  categoryId: string;
  categoryName: string | null;
  categorySlug: string | null;
  imageUrl: string | null;
  imageAssetId: string | null;
  imageAltText: string | null;
  status: boolean;
  sortOrder: number;
  branchServices: ManagementBranchService[];
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

export interface ServiceListResponse {
  success: boolean;
  data: ManagementService[];
  pagination: ServicePagination;
}
export interface ServiceDetailResponse {
  success: boolean;
  data: ManagementService;
}

export interface UpdateServicePayload {
  categoryId: string;
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
