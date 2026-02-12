import { useTest } from "@/context/TestContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import io from "socket.io-client";
import api from "../../api";

export default function TakeTest() {
    const { testId } = useLocalSearchParams<{ testId: string }>();
    const [test, setTest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showIndex, setShowIndex] = useState(false);

    const {
        answers,
        submitAnswer,
        forceSubmit,
        startTestContext,
        violationCount,
    } = useTest();

    const socketRef = useRef<any>(null);
    const isSelfPaced = test?.type === "self_paced";
    const totalQuestions = test?.questions?.length || 0;
    const visibleQuestions = test ? [test.questions[currentIndex]] : [];

    /* ---------------- Logic Hooks (Simplified for brevity) ---------------- */
    useEffect(() => {
        if (!test) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    forceSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [test]);

    useEffect(() => {
        startTest();
        return () => socketRef.current?.disconnect();
    }, []);

    const startTest = async () => {
        try {
            const res = await api.post(`/tests/${testId}/start`);
            const testRes = await api.get(`/tests/${testId}`);
            setTest(testRes.data);
            const startTime = new Date(res.data.startTime);
            const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
            const totalSeconds = testRes.data.duration * 60;
            setTimeLeft(Math.max(totalSeconds - elapsed, 0));
            startTestContext(testId, testRes.data.duration);
            setLoading(false);
            if (testRes.data.type === "teacher_controlled") setupSocket();
        } catch {
            Alert.alert("Error", "Unable to start test.");
            router.back();
        }
    };

    const setupSocket = async () => {
        const token = await AsyncStorage.getItem("token");

        const socket = io("https://mspa-1.onrender.com", {
            auth: { token },
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("✅ student connected", socket.id);
            socket.emit("join-test", { testId });
        });

        socket.on("sync-question", ({ index }) => {
            console.log("🔁 synced question", index);
            setCurrentIndex(index);
        });

        socket.on("end-test", () => {
            forceSubmit(true);
        });
    };


    const handleAnswerChange = (qId: string, value: any, type: string) => {
        submitAnswer(qId, type === "multiple_choice" ? { selectedOption: value } : { textAnswer: value });
    };

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="mt-4 text-slate-400 font-medium">Initializing Secure Environment...</Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* ===== ULTRA-CLEAN SYSTEM BAR ===== */}
            <View className="bg-slate-900 px-6 py-4 flex-row justify-between items-center shadow-lg">
                <View className="flex-row items-center space-x-2">
                    <View className={`w-2 h-2 rounded-full ${violationCount > 0 ? "bg-red-500 " : "bg-emerald-400"}`} />
                    <Text className="text-slate-400 text-[10px] font-black tracking-tighter uppercase">
                        PROCTORING ACTIVE
                    </Text>
                </View>

                <View className="flex-row items-center bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
                    <Text className="text-slate-500 font-bold text-xs mr-2">TIME LEFT</Text>
                    <Text className={`font-mono font-bold text-sm ${timeLeft < 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                    </Text>
                </View>
            </View>

            {/* ===== MODERN HEADER ===== */}
            <View className="bg-white px-6 pt-6 pb-2 border-b border-slate-200">
                <View className="flex-row justify-between items-end mb-4">
                    <View className="flex-1">
                        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Current Assessment</Text>
                        <Text className="text-2xl font-black text-slate-900 tracking-tight" numberOfLines={1}>
                            {test.title}
                        </Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-indigo-600 font-black text-xl">{currentIndex + 1}<Text className="text-slate-300 text-sm">/{totalQuestions}</Text></Text>
                    </View>
                </View>

                {/* Smooth Progress Bar */}
                <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                    <View
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                    />
                </View>

                {/* Index Toggle - Minimalist style */}
                {isSelfPaced && (
                    <Pressable
                        onPress={() => setShowIndex(!showIndex)}
                        className="py-3 flex-row items-center"
                    >
                        <View className={`w-4 h-4 rounded-sm border mr-2 items-center justify-center ${showIndex ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                            {showIndex && <View className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </View>
                        <Text className="text-slate-500 text-xs font-bold uppercase tracking-tight">Navigation Grid</Text>
                    </Pressable>
                )}

                {isSelfPaced && showIndex && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
                        <View className="flex-row pt-2">
                            {test.questions.map((q: any, idx: number) => {
                                const isAns = !!answers[q._id];
                                const isCur = currentIndex === idx;
                                return (
                                    <Pressable
                                        key={idx}
                                        onPress={() => setCurrentIndex(idx)}
                                        className={`w-10 h-10 mr-2 rounded-xl items-center justify-center border-2 
                                        ${isCur ? "bg-indigo-600 border-indigo-600" : isAns ? "bg-white border-emerald-500" : "bg-white border-slate-100"}`}
                                    >
                                        <Text className={`font-black text-xs ${isCur ? "text-white" : isAns ? "text-emerald-600" : "text-slate-400"}`}>
                                            {idx + 1}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}
            </View>

            {/* ===== CONTENT AREA ===== */}
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <View className="py-8">
                    {visibleQuestions.map((q: any) => (
                        <View key={q._id}>
                            <View className="flex-row items-center mb-6">
                                <View className="w-8 h-8 bg-indigo-100 rounded-lg items-center justify-center mr-3">
                                    <Text className="text-indigo-600 font-black">Q</Text>
                                </View>
                                <Text className="text-slate-400 font-bold uppercase tracking-tighter text-xs">Point Value: 1.0</Text>
                            </View>

                            <Text className="text-slate-800 text-xl font-bold leading-relaxed mb-10">
                                {q.questionText}
                            </Text>

                            {q.questionType === "multiple_choice" ? (
                                <View className="space-y-4">
                                    {q.options.map((opt: any, j: number) => {
                                        const isSel = answers[q._id]?.selectedOption === j;
                                        return (
                                            <TouchableOpacity
                                                key={j}
                                                onPress={() => handleAnswerChange(q._id, j, "multiple_choice")}
                                                activeOpacity={0.8}
                                                className={`p-5 rounded-2xl flex-row items-center border-2 mb-3 ${isSel ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 bg-white shadow-sm shadow-slate-200"}`}
                                            >
                                                <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${isSel ? 'border-indigo-600' : 'border-slate-200'}`}>
                                                    {isSel && <View className="w-3 h-3 rounded-full bg-indigo-600" />}
                                                </View>
                                                <Text className={`flex-1 text-base ${isSel ? "text-indigo-900 font-bold" : "text-slate-600 font-medium"}`}>
                                                    {opt.text}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ) : (
                                <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                    <TextInput
                                        multiline
                                        className="p-6 text-slate-800 text-lg min-h-[250px]"
                                        placeholder="Enter your response here..."
                                        placeholderTextColor="#cbd5e1"
                                        textAlignVertical="top"
                                        value={answers[q._id]?.textAnswer || ""}
                                        onChangeText={t => handleAnswerChange(q._id, t, "fill_in_blank")}
                                    />
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* ===== ELEGANT FOOTER ===== */}
            <View className="bg-white p-6 border-t border-slate-200 flex-row space-x-4 shadow-2xl">
                <TouchableOpacity
                    disabled={currentIndex === 0 || !isSelfPaced}
                    onPress={() => setCurrentIndex(prev => prev - 1)}
                    className={`px-8 py-4 rounded-2xl border border-slate-200 ${currentIndex === 0 ? 'opacity-20' : ''}`}
                >
                    <Text className="text-slate-700 font-black uppercase text-[10px] tracking-widest">Previous</Text>
                </TouchableOpacity>

                {currentIndex === totalQuestions - 1 ? (
                    <TouchableOpacity
                        onPress={() => forceSubmit(false)}
                        className="flex-1 py-4 rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200 items-center justify-center"
                    >
                        <Text className="text-white font-black uppercase text-[10px] tracking-widest">Submit Assessment</Text>
                    </TouchableOpacity>
                ) : (isSelfPaced &&
                    <TouchableOpacity
                        onPress={() => setCurrentIndex(prev => prev + 1)}
                        className="flex-1 py-4 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 items-center justify-center"
                    >
                        <Text className="text-white font-black uppercase text-[10px] tracking-widest">Save & Continue</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}