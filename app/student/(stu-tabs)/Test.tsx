import { backend } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
type Test = {
    _id: string;
    title: string;
    description: string;
    duration: number;
    createdAt?: string;
    createdBy: {
        name: string;
    };
};

const DUMMY_TESTS: Test[] = [
    {
        _id: "t1",
        title: "Math Test",
        description: "Basic arithmetic questions for 10th grade",
        duration: 30,
        createdAt: "2025-12-20T10:00:00Z",
        createdBy: { name: "Shraddha" },
    },
    {
        _id: "t2",
        title: "DSA Test",
        description: "Arrays, Strings and Linked List questions",
        duration: 45,
        createdAt: "2025-12-19T12:30:00Z",
        createdBy: { name: "Ayush" },
    },
    {
        _id: "t3",
        title: "Aptitude Test",
        description: "Logical reasoning and aptitude problems",
        duration: 25,
        createdAt: "2025-12-18T09:15:00Z",
        createdBy: { name: "Nirmitee" },
    },
    {
        _id: "t4",
        title: "React JS Test",
        description: "React concepts, hooks, and state management",
        duration: 40,
        createdAt: "2025-12-17T14:00:00Z",
        createdBy: { name: "Shraddha" },
    },
];

export default function Tests() {
    const [tests, setTests] = useState<Test[]>(DUMMY_TESTS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // For real backend, uncomment this
    /*
    useEffect(() => {
      const fetchTests = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
  
          if (!token) {
            router.replace("/student/student");
            return;
          }
  
          const res = await fetch(`${backend}/api/tests/active`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          if (!res.ok) throw new Error("Failed to fetch tests");
  
          const data = await res.json();
          setTests(data);
        } catch (err) {
          setError("Unable to load tests");
        } finally {
          setLoading(false);
        }
      };
      fetchTests();
    }, []);
    */
    const handleStartTest = async (testId: string) => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return router.replace("/student/student");

            const res = await fetch(`${backend}/api/tests/${testId}/open`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const err = await res.json();
                Alert.alert("Error", err.message);
                return;
            }

            const data = await res.json();

            // Navigate to test screen with questions & startTime
            router.push({
                pathname: "/student/selectedTest",
                params: {
                    testId,
                    startTime: data.startTime,
                    duration: data.duration,
                    questions: JSON.stringify(data.test.questions),
                },
            });
        } catch (err) {
            Alert.alert("Error", "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-100">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-100">
                <Text className="text-red-500 mb-3">{error}</Text>
                <TouchableOpacity
                    className="px-4 py-2 bg-blue-500 rounded"
                    onPress={() => router.replace("/")}
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 p-4 bg-gray-100">
            <Text className="text-2xl font-bold mb-4 text-gray-800">
                Available Tests
            </Text>

            {tests.length === 0 ? (
                <Text className="text-gray-500 text-center mt-10">
                    No tests available
                </Text>
            ) : (
                <FlatList
                    data={tests}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="bg-white p-5 mb-4 rounded-xl shadow-md"
                            onPress={() =>
                                router.push({
                                    pathname: "/student/selectedTest",
                                    params: { testId: item._id },
                                })
                            }
                        >
                            <Text className="text-lg font-bold text-gray-900">
                                {item.title}
                            </Text>
                            <Text className="text-gray-700 mt-1">{item.description}</Text>
                            <View className="mt-2">
                                <Text className="text-gray-500 text-sm">
                                    Duration: {item.duration} mins
                                </Text>
                                <Text className="text-gray-400 text-sm">
                                    Created:{" "}
                                    {item.createdAt
                                        ? new Date(item.createdAt).toLocaleString()
                                        : "-"}
                                </Text>
                            </View>
                            <Text className="text-gray-400 text-sm mt-1">
                                By: {item.createdBy.name}
                            </Text>
                            <TouchableOpacity
                                className="mt-3 bg-blue-500 py-2 rounded"
                                onPress={() => handleStartTest(item._id)}
                            >
                                <Text className="text-white font-semibold text-center">Start Test</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}
