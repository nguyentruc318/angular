export type StaffStatus = 'active' | 'inactive';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  status: StaffStatus;
}

export interface StaffFormValue {
  name: string;
  email: string;
  status: StaffStatus;
}

export interface StaffListParams {
  page: number;
  limit: number;
  search?: string;
  status?: StaffStatus;
}

export interface StaffPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StaffListResponse {
  data: StaffMember[];
  pagination: StaffPagination;
}
