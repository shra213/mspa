import api from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

type User = {
    id: string;
    name: string;
    email: string;
    role: "student" | "teacher";
    otp: any,
    pendingStudents: any,
    enrolledTeachers: any
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    register: (name: string, email: string, password: string, role: string, otp: any) => Promise<any>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    // 🔍 Check user on app start
    const checkUser = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            console.log(token);
            if (token) {
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                console.log("Calling /auth/me");
                const res = await api.get("/auth/me");
                // console.log("Response:", res);

                setUser(res.data.user);
                console.log(res.data.user);;
                await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
            } else {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        } catch (error) {
            console.log("Check user failed:", error);
            await clearSession();
        } finally {
            setLoading(false);
        }
    };

    // 🔐 Login
    const login = async (email: string, password: string) => {
        console.log({ email, password });
        const res = await api.post("/auth/login", { email, password });
        console.log(res.data);
        const { accessToken, refreshToken, user } = res.data;

        setUser(user);

        if (accessToken) {
            await AsyncStorage.setItem("token", accessToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        }

        if (refreshToken) {
            await SecureStore.setItemAsync("refreshToken", refreshToken);
        }

        await AsyncStorage.setItem("user", JSON.stringify(user));

        return res.data;
    };

    // 📝 Register
    const register = async (name: string, email: string, password: string, role: string, otp: any) => {
        const res = await api.post("/auth/register", {
            name,
            email,
            password,
            role,
            otp
        });
        console.log(res.data);
        return res.data;
    };

    // 🚪 Logout
    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.log(err);
        }
        await clearSession();
    };

    // 🧹 Clear everything
    const clearSession = async () => {
        setUser(null);
        await AsyncStorage.multiRemove(["token", "user"]);
        await SecureStore.deleteItemAsync("refreshToken");
        delete api.defaults.headers.common["Authorization"];

    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                refreshUser: checkUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
