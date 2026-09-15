export interface RevenuePoint {
  date: string;
  revenueMinor: number;
  bookingCount: number;
}
export interface BookingStatusPoint {
  status: string;
  label?: string;
  count: number;
}
export interface PopularServicePoint {
  serviceId: string;
  name: string;
  bookingCount: number;
  revenueMinor: number;
}

export interface DashboardData {
  revenueTrend: RevenuePoint[];
  bookingStatus: BookingStatusPoint[];
  popularServices: PopularServicePoint[];
}
export type RevenueRange = 7 | 14 | 30 | 'custom';
