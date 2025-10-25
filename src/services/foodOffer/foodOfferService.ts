import { FoodOfferRequest } from "@/types";
import { baseUrl } from "@/utils/axiosUtils";

export const getFoodOffersByRestraunt = async (restrauntId: string, token: string): Promise<FoodOfferRequest[]> => {
    try {
        const offers = await baseUrl.get(`/api/v1/food-offer/${restrauntId}`);
        return offers.data;
    } catch (error) {
        return [];
    }
}
export const getFoodOffersById = async (id: number): Promise<FoodOfferRequest | null> => {
    try {
        const offers = await baseUrl.get(`/api/v1/food-offer/get/${id}`);
        return offers.data;
    } catch (error) {
        return null;
    }
}