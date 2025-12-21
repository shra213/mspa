import { backend } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
export default function Profile() {
    const [prf, setPrf] = useState({});
    useEffect(() => {
        const getMe = async () => {
            const token = await AsyncStorage.getItem("token");
            console.log(token);
            const response = await fetch(`${backend}/api/auth/me`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                console.log("error");
                return;
            }
            const text = await response.text();
            const data = JSON.parse(text);
            setPrf(data.user);
            console.log(data);
        };
        getMe();
    }, []);

    return (
        <View className="flex-1 p-6">
            <Text className="text-2xl font-bold mb-4">Profile</Text>

            <View className="mb-3">
                <Text className="text-gray-500">Name</Text>
                <Text className="text-lg">{prf.name}</Text>
            </View>

            <View className="mb-3">
                <Text className="text-gray-500">Email</Text>
                <Text className="text-lg">{prf.email}</Text>
            </View>

            <View className="mb-6">
                <Text className="text-gray-500">Role</Text>
                <Text className="text-lg capitalize">{prf.role}</Text>
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
    )
}