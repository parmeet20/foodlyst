import { baseUrl } from "@/utils/axiosUtils";
import { User, RegisterUserInput } from "@/types/index";

export const registerUser = async (data: RegisterUserInput): Promise<User> => {
    try {
        const res = await baseUrl.post<User>("/api/v1/user/register", data);
        return res.data;
    } catch (error: any) {
        console.error("❌ Error in registerUser:", error?.response?.data || error.message);
        throw new Error(
            error?.response?.data?.message || "Registration failed. Please try again."
        );
    }
};

export const getUserFromToken = async(token:string):Promise<User | null>=>{
    try {
        const res = await baseUrl.get('/api/v1/user',{
            headers:{
                Authorization:'Bearer '+token
            }
        })
        return res.data;
    } catch (error) {
        console.log(error);
    }
    return null;
}