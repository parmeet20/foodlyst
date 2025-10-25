import { baseUrl } from "@/utils/axiosUtils";
import { User } from "@/types/index";

export const connectWalletHandler = async (userId: string, walletAddress: string, balance: number, token: string): Promise<void> => {
    try {
        const res = await baseUrl.post<User>(`/api/v1/user/connectwallet/${userId}`, {
            walletAddress,
            newBalance: balance
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (error: any) {
        console.error("❌ Error in registerUser:", error?.response?.data || error.message);
        throw new Error(
            error?.response?.data?.message || "Registration failed. Please try again."
        );
    }
};