import { backend } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, Text, View } from "react-native";

export default function ResultDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (!token || !id) return;
                const res = await fetch(`${backend}/results/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch result");
                const data = await res.json();
                setResult(data);
            } catch (error: any) {
                console.log("Error fetching result:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    const stats = useMemo(() => {
        if (!result) return null;
        const percentage = Math.round((result.score / result.totalMarks) * 100);
        const mins = Math.floor(result.timeTaken / 60);
        const secs = result.timeTaken % 60;
        return { percentage, timeStr: `${mins}m ${secs}s` };
    }, [result]);

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-[#1E3A8A]">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="text-white/60 mt-4 font-medium">Analyzing Performance...</Text>
        </View>
    );

    if (!result) return (
        <View className="flex-1 justify-center items-center bg-gray-50">
            <Text className="text-gray-400">Result detail unavailable</Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]">
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

                {/* HERO SECTION */}
                <View className="bg-[#1E3A8A] pt-12 pb-28 px-6 rounded-b-[50px] shadow-2xl">
                    <Text className="text-blue-200/70 text-center font-bold tracking-widest uppercase text-[10px] mb-2">Quiz Result</Text>
                    <Text className="text-white text-3xl font-black text-center mb-8">
                        {result.test.title}
                    </Text>

                    {/* STATS GLASS CARD */}
                    <View className="bg-white/10 border border-white/20 p-6 rounded-[32px] flex-row justify-between items-center">
                        <View className="items-center flex-1">
                            <View className="bg-blue-400/20 p-2 rounded-full mb-2">
                                <Text className="text-white text-lg">🎯</Text>
                            </View>
                            <Text className="text-white text-xl font-bold">{result.score}/{result.totalMarks}</Text>
                            <Text className="text-blue-200 text-[10px] font-bold uppercase">Score</Text>
                        </View>

                        <View className="w-[1px] h-10 bg-white/10" />

                        <View className="items-center flex-1">
                            <View className="bg-blue-400/20 p-2 rounded-full mb-2">
                                <Text className="text-white text-lg">⚡</Text>
                            </View>
                            <Text className="text-white text-xl font-bold">{stats?.percentage}%</Text>
                            <Text className="text-blue-200 text-[10px] font-bold uppercase">Accuracy</Text>
                        </View>

                        <View className="w-[1px] h-10 bg-white/10" />

                        <View className="items-center flex-1">
                            <View className="bg-blue-400/20 p-2 rounded-full mb-2">
                                <Text className="text-white text-lg">⏱️</Text>
                            </View>
                            <Text className="text-white text-xl font-bold">{stats?.timeStr}</Text>
                            <Text className="text-blue-200 text-[10px] font-bold uppercase">Time</Text>
                        </View>
                    </View>
                </View>

                {/* QUESTIONS LIST */}
                <View className="px-5 -mt-16 pb-12">
                    {result.answers?.map((ans: any, idx: number) => {
                        const selectedOption = ans.question.options[ans.selectedOption];
                        const correctOption = ans.question.options.find((opt: any) => opt.isCorrect);
                        const isCorrect = ans.isCorrect;

                        return (
                            <View key={idx} className="bg-white rounded-[32px] p-6 mb-6 shadow-xl shadow-blue-900/10 border border-gray-50">
                                {/* Header */}
                                <View className="flex-row justify-between items-start mb-5">
                                    <View>
                                        <Text className="text-[#1E3A8A] font-black text-xs uppercase tracking-tighter">Question {idx + 1}</Text>
                                        <View className="h-1 w-6 bg-[#1E3A8A] rounded-full mt-1" />
                                    </View>
                                    <View className={`px-4 py-1.5 rounded-full ${isCorrect ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                        <Text className={`text-[10px] font-black ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                            {isCorrect ? '✓ CORRECT' : '✕ INCORRECT'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Question Text */}
                                <Text className="text-slate-800 text-[17px] font-bold leading-6 mb-6">
                                    {ans.question.questionText}
                                </Text>

                                {/* Choice Detail */}
                                <View className="space-y-3">
                                    {/* User Choice */}
                                    <View className={`relative overflow-hidden rounded-2xl border-2 p-4 ${isCorrect ? 'border-emerald-500/20 bg-emerald-50/30' : 'border-rose-500/20 bg-rose-50/30'}`}>
                                        <View className={`absolute left-0 top-0 bottom-0 w-1 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Selection</Text>
                                        <Text className={`text-[15px] font-semibold ${isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                                            {selectedOption?.text || "Question Skipped"}
                                        </Text>
                                    </View>

                                    {/* Correct Solution if FAILED */}
                                    {!isCorrect && (
                                        <View className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/10 bg-indigo-50/30 p-4">
                                            <View className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                                            <Text className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Correct Answer</Text>
                                            <Text className="text-[15px] font-semibold text-indigo-900">
                                                {correctOption?.text}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}