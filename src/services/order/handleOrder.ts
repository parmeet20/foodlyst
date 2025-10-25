import { baseUrl } from "@/utils/axiosUtils";

export interface OrderData {
    userId: number;
    id?: number;
    restaurantId: number;
    foodOfferRequestId: number;
    quantity: number;
    totalPrice: number;
    txHash: string;
    createdAt?: Date;
    paymentId: string;
    token: string;
    status?: string;
}

export const bookOrderHandler = async (orderData: OrderData, token: string): Promise<boolean> => {
    try {
        const res = await baseUrl.post("/api/v1/order/create", orderData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return true;
    } catch (error) {
        console.error("Order booking failed:", error);
    }
    return false;
}