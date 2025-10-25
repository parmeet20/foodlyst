import { FoodOfferRequest } from "@/types";
import { baseUrl } from "@/utils/axiosUtils";

export interface FoodOfferRequestExtended extends FoodOfferRequest {
    restaurantId: number;
}

export const getAllOffersByLocationHandler = async (latitude: number, longitude: number): Promise<FoodOfferRequest[]> => {
    try {
        const res = await baseUrl.get(`/api/v1/food-offer/${latitude}/${longitude}`);
        return res.data as FoodOfferRequest[];
    } catch (error) {
        console.log(error);
    }
    return [];
}