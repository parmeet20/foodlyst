import { useAuthStore } from "@/store/userStore";
import { Restaurant } from "@/types";
import { baseUrl } from "@/utils/axiosUtils";
import { z } from "zod";

export const RestaurantInputSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    imageUrl: z.string(),
    contactNumber: z.string(),
    latitude: z.number(),
    longitude: z.number(),
});
export type RestaurantInputSchemaType = z.infer<typeof RestaurantInputSchema>;
export const createRestaurant = async (
    data: RestaurantInputSchemaType,
    token: string
): Promise<Restaurant | null> => {
    console.log(data);
    try {
        if (!token) {
            throw new Error("No token found. Please log in again.");
        }

        const response = await baseUrl.post<Restaurant>(
            "/api/v1/restaurant/create",
            data,
            {
                headers: {
                    // 👇 If your backend expects "Bearer"
                    Authorization: `Bearer ${token}`,
                    // Or just try: Authorization: token
                },
            }
        );

        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
};