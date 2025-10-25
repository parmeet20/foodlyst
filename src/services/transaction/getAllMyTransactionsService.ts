import { Transaction } from "@/types";
import { baseUrl } from "@/utils/axiosUtils";

export const getAllMyTransactions = async (userId: string, token: string): Promise<Transaction[]> => {
    try {
        const res = await baseUrl.get(`/api/v1/transaction/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return res.data as Transaction[];
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
    }
    return [];
}