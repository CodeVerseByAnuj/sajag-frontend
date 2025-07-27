import api from "@/config/axiosConfig";
import { GetItemParams , GetItemResponse} from "@/interface/itemImterface";

export const getItems = async (
  params: GetItemParams
): Promise<GetItemResponse> => {
  try {
    const response = await api.get(`/api/item/get-items`, { params });
    const { page, limit, total } = response.data.data;
console.log(response.data,'88')
    return {
      data:  response.data.data.data,
      page,
      limit,
      total,
    };
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to fetch items.";
    throw new Error(msg);
  }
};

export const getItemById = async (itemId: string): Promise<GetItemResponse> => {
  try {
    const response = await api.get(`/api/item/get-item/${itemId}`);
    return response.data.data;
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to fetch item.";
    throw new Error(msg);
  }
};

export const addOrUpdateItem = async (data: any): Promise<any> => {
  try {
    const response = await api.post(`/api/item/add-item`, data);
    return response.data;
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Failed to add or update item.";
    throw new Error(msg);
  }
};