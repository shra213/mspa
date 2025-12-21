import { backend } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type UserProfile = {
    name: string;
    email: string;
    role: "student" | "teacher";
    enrolledTeachers: {};
};

export default function Profile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await AsyncStorage.getItem("accessToken");
                console.log(token);
                if (!token) {
                    router.replace("./student/student");
                    return;
                }

                const res = await fetch(`${backend}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data: UserProfile = await res.json();
                setProfile(data.user);
            } catch (err) {
                setError("Unable to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error || !profile) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-red-500 mb-4">{error}</Text>
                <TouchableOpacity onPress={() => router.replace("/")}>
                    <Text className="text-blue-500">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 p-6">
            <Text className="text-2xl font-bold mb-4">Profile</Text>

            <View className="mb-3">
                <Text className="text-gray-500">Name</Text>
                <Text className="text-lg">{profile.name}</Text>
            </View>

            <View className="mb-3">
                <Text className="text-gray-500">Email</Text>
                <Text className="text-lg">{profile.email}</Text>
            </View>

            <View className="mb-6">
                <Text className="text-gray-500">Role</Text>
                <Text className="text-lg capitalize">{profile.role}</Text>
            </View>

            <TouchableOpacity
                className="bg-red-500 p-3 rounded-xl"
                onPress={async () => {
                    await AsyncStorage.removeItem("token");
                    router.replace("./student/student");
                }}
            >
                <Text className="text-white text-center font-semibold">
                    Logout
                </Text>
            </TouchableOpacity>
        </View>
    );
}
