import { ENV } from "@/config/envConfig";
import axios from "axios";
export const baseUrl = axios.create({
    baseURL: ENV.NEXT_PUBLIC_BACKEND_URL,
})