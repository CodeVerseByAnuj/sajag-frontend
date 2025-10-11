
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

