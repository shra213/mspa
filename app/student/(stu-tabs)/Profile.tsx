import { backend } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ProfileType = {
    name?: string;
    email?: string;
    role?: string;
};

export default function Profile() {
    const [prf, setPrf] = useState<ProfileType>({});

    useEffect(() => {
        const getMe = async () => {
            const token = await AsyncStorage.getItem("token");

            const response = await fetch(`${backend}/api/auth/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.log("error");
                return;
            }

            const data = await response.json();
            setPrf(data.user);
        };

        getMe();
    }, []);

    return (
        <View className="flex-1 bg-white px-6 justify-center">

            {/* Avatar */}
            <View className="items-center mb-6">
                <View className="h-28 w-28 rounded-full bg-blue-500 items-center justify-center">
                    <Text className="text-4xl font-bold text-white">
                        {prf.name?.charAt(0).toUpperCase()}
                    </Text>
                </View>

                <Text className="text-2xl font-bold mt-3">
                    {prf.name}
                </Text>

                <Text className="text-gray-500">
                    {prf.email}
                </Text>
            </View>

            {/* Info Card */}
            <View className="bg-gray-100 rounded-2xl p-5 mb-6">
                <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-500">Name</Text>
                    <Text className="font-semibold">{prf.name}</Text>
                </View>

                <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-500">Email</Text>
                    <Text className="font-semibold">{prf.email}</Text>
                </View>

                <View className="flex-row justify-between">
                    <Text className="text-gray-500">Role</Text>
                    <Text className="font-semibold capitalize">{prf.role}</Text>
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                className="bg-blue-500 py-4 rounded-2xl"
                onPress={async () => {
                    await AsyncStorage.removeItem("token");
                    await SecureStore.deleteItemAsync("refreshToken");
                    router.replace("/student/student");
                }}
            >
                <Text className="text-white text-center font-bold text-lg">
                    Logouot
                </Text>
            </TouchableOpacity>
        </View>
    );
}
