import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
// import { backend } from "./constants/theme";
const backend = "http://10.223.118.192:5000/api";
/**
 * MAIN API
 */
const api = axios.create({
    baseURL: `${backend}`,
    timeout: 30000,
});

/**
 * REFRESH API (NO INTERCEPTORS)
 */
const refreshApi = axios.create({
    baseURL: backend,
});

/**
 * CLEAR SESSION
 */
const clearSessionAndRedirect = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    await SecureStore.deleteItemAsync("refreshToken");

    delete api.defaults.headers.common.Authorization;

    setTimeout(() => {
        router.replace("/auth/student");
    }, 0);
};

/**
 * REQUEST INTERCEPTOR
 */
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as any;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh-token")
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = await SecureStore.getItemAsync("refreshToken");

                if (!refreshToken) {
                    await clearSessionAndRedirect();
                    return Promise.reject(error);
                }

                const res = await refreshApi.post("/auth/refresh-token", {
                    refreshToken,
                });

                const { accessToken } = res.data;

                await AsyncStorage.setItem("token", accessToken);

                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return api(originalRequest);
            } catch (err) {
                await clearSessionAndRedirect();
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
