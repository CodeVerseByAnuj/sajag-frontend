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
  customerId?: string;
  page: number;
  limit: number;
  name?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetItemResponse {
  data: ItemInterface[];
  page: number;
  limit: number;
  total: number;
}

export interface ItemInterface {
  id: string;
  name: string;
  category: string;
  percentage: number;
  amount: number;
  itemWeight: string; // If this should be a number, change to: number
  imagePath: string;
  description: string;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

export interface AddItemInput {
  itemId?: string; // Optional for update
  customerId: string; // Required
  name: string;
  itemWeight: string;
  category: "gold" | "silver";
  percentage: number;
  amount: number;
  description?: string;
  orderId?: string; // Optional: auto-create if blank
}

export interface AddItemResponse {
  success: boolean;
  message: string;
  data: {
    itemId: { itemId: string };
  };
}
