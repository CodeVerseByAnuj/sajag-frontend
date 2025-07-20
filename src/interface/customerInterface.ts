export interface GetCustomerParams {
    page?: number;
    limit?: number;
    name?: string;
    guardianName?: string;
    address?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface customerInterface {
    id: string
    name: string
    guardianName: string
    address: string
    relation: string
    createdAt: string
    updatedAt: string
}

export interface GetCustomerResponse {
  success: boolean;
  message: string;
  data: {
    customers: customerInterface[]; // 👈 nested "data.data"
    page: number;
    limit: number;
    total: number;
  };
}
