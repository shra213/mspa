import { backend } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EnrollTeacher() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEnroll = async () => {
        if (code.length !== 4) {
            Alert.alert("Error", "Please enter a valid 4-digit code");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Error", "You are not logged in");
                return;
            }
            //enroll
            const res = await fetch(`${backend}/teacher/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();
            console.log(data);
            if (!res.ok) {
                Alert.alert("Error", data.message || "Failed to enroll");
            } else {
                Alert.alert(
                    "Success",
                    `Successfully request sent to teacher ${data.teacher.name} (${data.teacher.email})`
                    // `Successfully enrolled with teacher ${data.teacher.name} (${data.teacher.email})`
                );
                setCode(""); // clear input
                router.replace("/student/(stu-tabs)/Test");
            }
        } catch (err) {
            Alert.alert("Error", "Something went wrong");
            console.error(err);
            router.replace("/student/Analytics");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50 justify-center">
            {/* Title */}
            <View className="bg-white p-5 py-10 rounded-lg border-slate-200 shadow-black border mx-5">
                <Text className="text-2xl font-extrabold text-indigo-900 text-center mb-3">
                    Enroll with Teacher
                </Text>

                {/* Subtitle */}
                <Text className="text-gray-600 text-sm mb-10 text-center">
                    Enter your teacher's 4-digit enrollment code to join their class.
                </Text>

                {/* Input */}
                <TextInput
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={4}
                    placeholder="1234"
                    className="border border-gray-300 rounded-xl p-2 mb-6 bg-white text-center text-lg font-medium shadow-sm"
                />

                {/* Enroll Button */}
                <TouchableOpacity
                    onPress={handleEnroll}
                    className="bg-indigo-600 py-4 rounded-xl shadow-md"
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-center text-lg font-semibold">
                            Enroll
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
