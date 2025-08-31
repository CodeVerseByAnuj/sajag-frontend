
export interface PaymentCurrentStatus {
  originalAmount: number;
  remainingAmount: number;
  totalPaid: number;
  interestPaidTill: string | null;
  monthlyInterestRate: number;
}

export interface PaymentSummary {
  totalAmountPaid: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
}

export interface Payment {
  id?: string;
  amount: number;
  interestAmount?: number;
  principalAmount?: number;
  paymentDate: string;
  paymentType?: "interest" | "principal" | "both";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemPaymentDetails {
  itemId: string;
  currentStatus: PaymentCurrentStatus;
  summary: PaymentSummary;
  payments: Payment[];
}

export interface GetPaymentResponse {
  success?: boolean;
  message?: string;
  data: ItemPaymentDetails;
}

export interface AddPaymentInput {
  itemId: string;
  amount: number;
  paymentType: "interest" | "principal" | "both";
  paymentDate: string;
  notes?: string;
}

export interface AddPaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: string;
    currentStatus: PaymentCurrentStatus;
  };
}

export interface GetPaymentHistoryParams {
  itemId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  data: {
    payments: Payment[];
    page: number;
    limit: number;
    total: number;
  };
}

export interface CalculateInterestRequest {
  amount: number;
  startDate: string;
  endDate: string;
  percentage: number;
}

export interface CalculateInterestResponse {
  success: boolean;
  message: string;
  data: {
    amount: number;
    monthlyRate: number;
    startDate: string;
    endDate: string;
    daysCalculated: number;
    interest: number;
    totalAmount: number;
  };
}

export interface AddPaymentInput {
  itemId: string;
  interestAmount: number | null;
  principalAmount: number | null;
  paymentDate: string;
}

export interface AddPaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: string;
    currentStatus: PaymentCurrentStatus;
  };
}
