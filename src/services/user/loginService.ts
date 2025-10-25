import { baseUrl } from "@/utils/axiosUtils";
import { User } from "@/types/index";
import { useAuthStore } from "@/store/userStore";

export interface LoginInput {
    email: string;
    password: string;
}

export const loginUser = async (data: LoginInput): Promise<User> => {
    try {
        const res = await baseUrl.post<{ token: string }>("/api/v1/user/login", data);

        const token = res.data.token;


        const { setToken, setUser } = useAuthStore.getState();
        setToken(token);

        baseUrl.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        localStorage.setItem("token", JSON.stringify(token));

        const userRes = await baseUrl.get<User>("/api/v1/user");
        setUser(userRes.data);

        return userRes.data;
    } catch (error) {
        console.error("❌ Error in loginUser:", error);
        throw new Error("Login failed. Please check your credentials."
        );
    }
};
