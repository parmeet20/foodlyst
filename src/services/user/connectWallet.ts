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
    } catch (error) {
        console.error("❌ Error in registerUser:", error);
        throw new Error("Registration failed. Please try again."
        );
    }
};