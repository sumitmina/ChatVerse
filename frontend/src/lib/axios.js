import axios from "axios";

const backend_url = import.meta.env.VITE_BACKEND_URL

export const axiosInstance = axios.create({
    // baseURL: "http://localhost:8000/api",
    baseURL: `${backend_url}/api`,
    withCredentials: true
});