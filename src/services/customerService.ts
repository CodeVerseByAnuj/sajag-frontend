import api from "@/config/axiosConfig";
import { GetCustomerParams , GetCustomerResponse } from "@/interface/customerInterface";


export const getCustomers = async (
  params: GetCustomerParams
): Promise<GetCustomerResponse> => {
  try {
    const response = await api.get("/api/customer", { params });
    const { customers, page, limit, total } = response.data.data;

    return {
      success: true,
      message: "Customers fetched successfully",
      data: {
        customers, // customer list
        page,
        limit,
        total,
      },
    };
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to fetch customers.";
    throw new Error(msg);
  }
};

