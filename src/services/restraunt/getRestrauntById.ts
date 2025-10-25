import { Restaurant } from "@/types"
import { baseUrl } from "@/utils/axiosUtils"

export const getRestrauntByid = async (id: string): Promise<Restaurant | null> => {
    try {
        const restraunt = await baseUrl.get(`/api/v1/restaurant/${id}`);
        if (!restraunt) return null;
        return restraunt.data;
    } catch (error) {
        console.log("Error fetching restraunt");
        return null;
    }
}