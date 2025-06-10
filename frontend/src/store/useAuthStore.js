import {create} from "zustand"

import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

import {io, Socket} from "socket.io-client"

const backend_url = import.meta.env.VITE_BACKEND_URL

console.log(backend_url);


export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth : async() => {
        try {
            const {data} = await axiosInstance.get("auth/check");
            set({authUser: data.data})
            get().connectSocket();
        } catch (error) {
            set({authUser: null})
        } finally{
            set({isCheckingAuth: false})
        }
    },

    signUp : async(formData) => {
        set({isSigningUp: true})
        try {
            const {data} = await axiosInstance.post("/auth/signup", formData) 
            set({authUser: data.data})
            toast.success(data.message)
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message)
        } finally{
            set({isSigningUp: false});
        }
    },

    login : async(formData) => {
        set({isLoggingIn: true})
        try {
            const {data} = await axiosInstance.post("/auth/login", formData)
            set({authUser: data.data})
            toast.success(data.message)

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set({isLoggingIn: false})
        }
    },

    logout : async() => {
        try{
            await axiosInstance.post("/auth/logout")
            set({authUser: null})
            toast.success("Logged out successfully")
            get().disconnectSocket()
        }catch(error){
            toast.error(error.response.data.message)
        }
    },

    updateProfile : async (avatar) => {
        set({isUpdatingProfile: true})
        try {
            const {data} = await axiosInstance.put("/auth/update-profile", avatar)
            set({authUser: data.data})
            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isUpdatingProfile: false});
        }

    },

    connectSocket : () => {
        const {authUser} = get()
        if(!authUser || get().socket?.connected){
            return;
        }
        const socket = io(backend_url, {
            query: {
                userId: authUser._id,
            },
        })
        socket.connect();
        set({socket: socket})

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        } )
    },
    disconnectSocket : () => {
        if(get().socket?.connected) get().socket.disconnect();
    },

}));