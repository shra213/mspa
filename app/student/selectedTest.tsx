import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

type Option = {
    text: string;
};

type Question = {
    _id: string;
    questionText: string;
    options: Option[];
    marks: number;
};

export default function SelectedTest() {
    const router = useRouter();
    const params = useLocalSearchParams(); // correct way in Expo Router v2

    // Dummy data for showing
    const dummyQuestions: Question[] = [
        {
            _id: "q1",
            questionText: "What is 2 + 2?",
            options: [{ text: "3" }, { text: "4" }, { text: "5" }, { text: "6" }],
            marks: 1,
        },
        {
            _id: "q2",
            questionText: "Which language is used for React Native?",
            options: [
                { text: "Java" },
                { text: "Kotlin" },
                { text: "JavaScript" },
                { text: "Python" },
            ],
            marks: 2,
        },
        {
            _id: "q3",
            questionText: "Select the correct array syntax in JavaScript:",
            options: [
                { text: "arr = ()" },
                { text: "arr = []" },
                { text: "arr = {}" },
                { text: "arr = <>" },
            ],
            marks: 1,
        },
    ];

    // For real API, you could replace this with:
    // const questions: Question[] = JSON.parse(params.questions as string);

    const [questions] = useState<Question[]>(dummyQuestions);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [remainingTime, setRemainingTime] = useState(10 * 60); // 10 min dummy timer

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    Alert.alert("Time's up!", "Your test has ended.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleSelectOption = (questionId: string, optionText: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionText }));
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <View className="flex-1 p-4 bg-gray-100">
            <Text className="text-xl font-bold mb-4 text-gray-800">
                Test: {params.testId || "Dummy Test"}
            </Text>
            <Text className="text-red-500 font-semibold mb-4">
                Time Remaining: {formatTime(remainingTime)}
            </Text>

            <FlatList
                data={questions}
                keyExtractor={(item) => item._id}
                renderItem={({ item, index }) => (
                    <View className="bg-white p-4 mb-4 rounded-xl shadow">
                        <Text className="font-semibold text-gray-900 mb-2">
                            {index + 1}. {item.questionText} ({item.marks} marks)
                        </Text>
                        {item.options.map((opt, i) => {
                            const selected = answers[item._id] === opt.text;
                            return (
                                <TouchableOpacity
                                    key={i}
                                    className={`p-2 mb-2 rounded border ${selected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                                        }`}
                                    onPress={() => handleSelectOption(item._id, opt.text)}
                                >
                                    <Text className={`${selected ? "text-white" : "text-gray-800"}`}>
                                        {opt.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            />
        </View>
    );
}
