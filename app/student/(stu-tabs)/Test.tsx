import { backend } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Test = {
    id: string;
    title: string;
    subject: string;
    date: string;
};

export default function Tests() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const token = await AsyncStorage.getItem("token");

                if (!token) {
                    router.replace("/student/student");
                    return;
                }

                const res = await fetch(`${backend}/api/tests`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch tests");
                }

                const data: Test[] = await res.json();
                setTests(data);
            } catch (err) {
                setError("Unable to load tests");
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-red-500 mb-3">{error}</Text>
                <TouchableOpacity onPress={() => router.replace("/")}>
                    <Text className="text-blue-500">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 p-4">
            <Text className="text-2xl font-bold mb-4">Tests</Text>

            {tests.length === 0 ? (
                <Text className="text-gray-500 text-center">
                    No tests available
                </Text>
            ) : (
                <FlatList
                    data={tests}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="bg-white p-4 mb-3 rounded-xl shadow"
                            onPress={() =>
                                router.push(`/tests/${item.id}`)
                            }
                        >
                            <Text className="text-lg font-semibold">
                                {item.title}
                            </Text>
                            <Text className="text-gray-500">
                                {item.subject}
                            </Text>
                            <Text className="text-gray-400 text-sm">
                                {item.date}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}
