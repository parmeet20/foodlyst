import { baseUrl } from "@/utils/axiosUtils";
import { OrderData } from "./handleOrder";

export interface OrderResponse {
  success: boolean;
  message: string;
  orders: OrderData[];
}

export const getAllMyOrders = async (userId: string, token: string): Promise<OrderResponse | null> => {
  try {
    const res = await baseUrl.get(`/api/v1/order/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Order fetching failed:', error);
    return null;
  }
};