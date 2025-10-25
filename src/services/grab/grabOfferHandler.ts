import { GrabOffer } from "@/types";
import { baseUrl } from "@/utils/axiosUtils";

export const grabMyOrderHandler = async (rating: number, orderToken: string, authToken: string): Promise<GrabOffer | null> => {
    try {
        const res = await baseUrl.post(`/api/v1/grab/order/${orderToken}`, { rating }, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        });
        return res.data as GrabOffer;
    } catch (error) {
        const message = 'Failed to grab order';
        throw new Error(message);
    }
};