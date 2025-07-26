import api from "@/config/axiosConfig";
import { GetCustomerParams , GetCustomerResponse , CustomerInputInterface , AddCustomerResponseInterface } from "@/interface/customerInterface";


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

export const addOrUpdateCustomer = async (
  customerData: CustomerInputInterface
): Promise<AddCustomerResponseInterface> => {
  try {
    console.log(customerData,'customerData')
    const response = await api.post("/api/customer/create-customer", customerData);

    return {
      success: true,
      message: response.data?.message || "Customer created successfully",
      data: response.data?.data,
    };
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to create customer.";
    throw new Error(msg);
  }
};

export const getCustomerById = async (customerId: string): Promise<CustomerInputInterface> => {
  try {
    const response = await api.get(`/api/customer/${customerId}`);
    return response.data.data;
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to fetch customer details.";
    throw new Error(msg);
  }
};

export const deleteCustomer = async (customerId: string): Promise<void> => {
  try {
    await api.delete(`/api/customer/delete-customer/${customerId}`);
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to delete customer.";
    throw new Error(msg);
  }
};


