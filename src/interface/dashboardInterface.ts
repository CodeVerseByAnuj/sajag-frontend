export interface DashboardData {
  totalCustomers: number;
  totalAmount: number;
  totalInterest: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  totalItems: number;
  averageInterestRate: number;
}

export interface GetDashboardResponse {
  success: boolean;
  message?: string;
  data: DashboardData;
}

// Interfaces for daily aggregates response (e.g. daily totals for charts)
export interface DailyAggregatesDataset {
  label: string;
  data: number[];
}

export interface DailyAggregatesData {
  labels: string[]; // ISO date strings
  datasets: DailyAggregatesDataset[];
}

export interface DailyAggregatesResponse {
  success: boolean;
  message?: string;
  data: DailyAggregatesData;
}
