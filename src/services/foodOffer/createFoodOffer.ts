import { FoodOfferRequest } from "@/types";
import { baseUrl } from "@/utils/axiosUtils";

export const createFoodOffer = async (data: FoodOfferRequest, token: string): Promise<FoodOfferRequest | null> => {
    try {
        baseUrl.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await baseUrl.post('/api/v1/food-offer/create', data);
        return res.data;
    } catch (error) {
        return null;
    }
}