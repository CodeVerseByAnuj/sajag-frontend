export interface ItemInterface {
  id: string;
  name: string;
  category: string;
  percentage: number;
  amount: number;
  itemWeight: string;
  imagePath: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetItemParams {
  page: number;
  limit: number;
  name?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetItemResponse {
  data: ItemInterface[];
  page: number;
  limit: number;
  total: number;
}
