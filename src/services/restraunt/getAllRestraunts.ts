import { Restaurant } from "@/types";
import { baseUrl } from "@/utils/axiosUtils"

export const getAllRestraunts = async (): Promise<Restaurant[]> => {
    try {
        const restraunts = await baseUrl.get<Restaurant[]>('/api/v1/restaurant');
        console.log(restraunts);
        return restraunts.data;
    } catch (error) {
        return [];
    }
}