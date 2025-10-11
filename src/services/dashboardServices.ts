import api from "@/config/axiosConfig";
import { GetDashboardResponse } from "@/interface/dashboardInterface";

export const getDashboardStats = async (): Promise<GetDashboardResponse> => {
    try {
        const response = await api.get("/api/insights");
        return {
            success: true,
            message: "Dashboard stats fetched successfully",
            data: response.data.data
        };
    } catch (error: any) {
        const msg = error?.response?.data?.message || "Failed to fetch dashboard stats.";
        throw new Error(msg);
    }
};
