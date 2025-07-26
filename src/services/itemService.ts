import api from "@/config/axiosConfig";
import { GetItemParams , GetItemResponse} from "@/interface/itemImterface";

export const getItems = async (
  params: GetItemParams
): Promise<GetItemResponse> => {
  try {
    const response = await api.get("/api/item/get-items?customerId=cmdbui65c0001tkhcqt4ouzql", { params });
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