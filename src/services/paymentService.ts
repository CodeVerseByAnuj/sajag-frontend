import api from "@/config/axiosConfig";
import { 
  GetPaymentResponse, 
  AddPaymentInput, 
  AddPaymentResponse, 
  GetPaymentHistoryParams,
  PaymentHistoryResponse,
  CalculateInterestRequest,
  CalculateInterestResponse,
  
} from "@/interface/paymentInterface";

/**
 * Get payment details for a specific item
 * @param itemId The ID of the item to get payment details for
 */
export const getPaymentDetails = async (customerId: string): Promise<GetPaymentResponse> => {
  try {
    const response = await api.get(`/api/payment/payment/${customerId}`);
    return {
      success: true,
      message: "Payment details fetched successfully",
      data: response.data.data
    };
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to fetch payment details.";
    throw new Error(msg);
  }
};

/**
 * Add a new payment for an item
 * @param paymentData The payment data to add
 */
export const addPayment = async (paymentData: AddPaymentInput): Promise<AddPaymentResponse> => {
  try {
    const response = await api.post("/api/payment/add-payment", paymentData);
    return {
      success: true,
      message: response.data?.message || "Payment added successfully",
      data: response.data?.data
    };
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to add payment.";
    throw new Error(msg);
  }
};

/**
 * Get payment history for a specific item or customer
 * @param params Query parameters to filter payment history
 */
export const getPaymentHistory = async (
  params: GetPaymentHistoryParams
): Promise<PaymentHistoryResponse> => {
  try {
    const response = await api.get("/api/payment/payment", { params });
    
    return {
      success: true,
      message: "Payment history fetched successfully",
      data: {
        payments: response.data.data.payments,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total: response.data.data.total
      }
    };
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to fetch payment history.";
    throw new Error(msg);
  }
};

/**
 * Get payment history for a specific item by ID
 * @param itemId The ID of the item to get payment history for
 */
export const getPaymentHistoryByItemId = async (itemId: string): Promise<PaymentHistoryResponse> => {
  try {
    const response = await api.get(`/api/payment/payment/${itemId}`);
    console.log(response.data);
    
    return {
      success: true,
      message: "Payment history fetched successfully",
      data: response.data
    };
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to fetch payment history.";
    throw new Error(msg);
  }
};

/**
 * Delete a payment
 * @param paymentId The ID of the payment to delete
 */
export const deletePayment = async (paymentId: string): Promise<void> => {
  try {
    await api.delete(`/api/payment/delete-payment/${paymentId}`);
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to delete payment.";
    throw new Error(msg);
  }
};

/**
 * Calculate interest based on amount, dates, and percentage
 * @param data The calculation parameters
 */
export const calculateInterest = async (
  data: CalculateInterestRequest
): Promise<CalculateInterestResponse> => {
  try {
    const response = await api.post("/api/payment/calculate-interest", data);
    console.log("API response:", response.data);
    return {
      success: true,
      message: "Interest calculated successfully",
      data: response.data.data
    };
  } catch (error: any) {
    console.error("Calculate interest API error:", error);
    console.error("Response data:", error?.response?.data || error?.response?.data.error);
    console.error("Status:", error?.response?.status);
    
    const msg = error?.response?.data?.message || "Failed to calculate interest.";
    throw new Error(msg);
  }
};

export const payment = async (paymentData: any): Promise<AddPaymentResponse> => {
  try {
    const response = await api.post("/api/payment/payment", paymentData);
    return {
      success: true,
      message: response.data?.message || "Payment added successfully",
      data: response.data?.data
    };
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to add payment.";
    throw new Error(msg);
  }
};
