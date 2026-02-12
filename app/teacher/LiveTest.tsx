import { backend } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Pressable, SafeAreaView, StatusBar, Text, View } from "react-native";
import io from "socket.io-client";

const LiveTest = () => {
    const { testId } = useLocalSearchParams();
    const router = useRouter();

    const [students, setStudents] = useState<any[]>([]);
    const [testDetails, setTestDetails] = useState<any>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const socketRef = useRef<any>(null);

    useEffect(() => {
        const init = async () => {
            const token = await AsyncStorage.getItem("token");
            await fetchTestDetails(token);
            setupSocket(token);
        };
        init();
        return () => socketRef.current?.disconnect();
    }, [testId]);

    const fetchTestDetails = async (token: string | null) => {
        if (!token) return;
        const res = await fetch(`${backend}/tests/${testId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTestDetails(data);
    };

    const setupSocket = (token: string | null) => {
        if (!token) return;
        const socket = io('https://mspa-1.onrender.com', {
            auth: { token },
            transports: ['websocket'],
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join-test", { testId });
        });

        socket.on("student-joined", (student) => {
            setStudents(prev => {
                const exists = prev.find(s => s._id === student._id);
                if (exists) return prev;
                return [...prev, student];
            });
        });

        socket.on("student-submitted", ({ studentId }) => {
            setStudents(prev =>
                prev.map(s => s._id === studentId ? { ...s, submitted: true } : s)
            );
        });
    };

    const changeQuestion = (index: number) => {
        if (!testDetails || index < 0 || index >= testDetails.questions.length) return;
        setCurrentQuestion(index);
        socketRef.current.emit("question-change", { testId, index });
    };

    const endTest = () => {
        Alert.alert("End Test", "Are you sure you want to terminate this live session?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "End Now",
                style: "destructive",
                onPress: () => {
                    socketRef.current.emit("end-test", { testId });
                    router.back();
                }
            }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" />

            {/* COMMAND CENTER HEADER */}
            <View className="bg-[#1E3A8A] pt-6 pb-24 px-6 rounded-b-[40px] shadow-2xl">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-blue-200/70 font-black text-[10px] tracking-[2px] uppercase">Live Console</Text>
                        <Text className="text-white text-2xl font-black mt-1">
                            {testDetails?.title || "Loading..."}
                        </Text>
                    </View>
                    <View className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full flex-row items-center">
                        <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                        <Text className="text-red-400 text-[10px] font-bold uppercase tracking-tighter">Live</Text>
                    </View>
                </View>

                {/* DASHBOARD STATS */}
                <View className="bg-white/10 border border-white/20 p-5 rounded-[30px] flex-row justify-between items-center shadow-xl">
                    <View className="items-center flex-1">
                        <Text className="text-white text-xl font-black">{currentQuestion + 1}<Text className="text-blue-200/40 text-sm">/{testDetails?.questions.length || 0}</Text></Text>
                        <Text className="text-blue-200/50 text-[9px] font-bold uppercase mt-1">Active Q</Text>
                    </View>
                    <View className="w-[1px] h-8 bg-white/10" />
                    <View className="items-center flex-1">
                        <Text className="text-white text-xl font-black">{students.length}</Text>
                        <Text className="text-blue-200/50 text-[9px] font-bold uppercase mt-1">Students</Text>
                    </View>
                    <View className="w-[1px] h-8 bg-white/10" />
                    <View className="items-center flex-1">
                        <Text className="text-emerald-400 text-xl font-black">{students.filter(s => s.submitted).length}</Text>
                        <Text className="text-blue-200/50 text-[9px] font-bold uppercase mt-1">Submitted</Text>
                    </View>
                </View>
            </View>

            {/* CONTROLS SECTION */}
            <View className="px-6 -mt-12">
                <View className="bg-white rounded-[32px] p-6 shadow-xl shadow-blue-900/10 border border-slate-100">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">Master Controls</Text>

                    <View className="flex-row gap-3">
                        <Pressable
                            onPress={() => changeQuestion(currentQuestion - 1)}
                            disabled={currentQuestion === 0}
                            className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center ${currentQuestion === 0 ? 'bg-slate-100' : 'bg-slate-800 '}`}
                        >
                            <Text className={`font-bold ${currentQuestion === 0 ? 'text-slate-300' : 'text-white'}`}>Previous Q</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => changeQuestion(currentQuestion + 1)}
                            disabled={currentQuestion === (testDetails?.questions.length - 1)}
                            className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center ${currentQuestion === (testDetails?.questions.length - 1) ? 'bg-slate-100' : 'bg-[#1E3A8A] '}`}
                        >
                            <Text className={`font-bold ${currentQuestion === (testDetails?.questions.length - 1) ? 'text-slate-300' : 'text-white'}`}>Next Q</Text>
                        </Pressable>
                    </View>

                    <Pressable
                        onPress={endTest}
                        className="mt-4 py-4 rounded-2xl bg-rose-50 border-2 border-rose-100 items-center"
                    >
                        <Text className="text-rose-600 font-black tracking-widest text-xs uppercase">Terminate Test Session</Text>
                    </Pressable>
                </View>
            </View>

            {/* STUDENT LIST */}
            <View className="flex-1 px-6 mt-8">
                <View className="flex-row justify-between items-end mb-4 px-2">
                    <Text className="text-slate-800 font-black text-lg">Active Participants</Text>
                    <Text className="text-blue-600 font-bold text-xs">{students.length} Online</Text>
                </View>

                <FlatList
                    data={students}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    renderItem={({ item }) => (
                        <View className="bg-white p-4 mb-3 rounded-2xl flex-row justify-between items-center shadow-sm border border-slate-100">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
                                    <Text className="text-slate-600 font-bold">{item.name.charAt(0)}</Text>
                                </View>
                                <View>
                                    <Text className="text-slate-900 font-bold">{item.name}</Text>
                                    <Text className="text-slate-400 text-[10px] uppercase">Student ID: {item._id.slice(-6)}</Text>
                                </View>
                            </View>

                            <View className={`px-3 py-1 rounded-full ${item.submitted ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                <Text className={`text-[10px] font-black ${item.submitted ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {item.submitted ? "SUBMITTED" : "WRITING"}
                                </Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="items-center mt-10">
                            <Text className="text-slate-400 italic font-medium">Waiting for students to join...</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
};

export default LiveTest;