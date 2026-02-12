import { backend } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';

const StudentResultDetail = () => {
    const { result_id } = useLocalSearchParams();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchResultDetail = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${backend}/results/${result_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await response.json();
            setResult(json);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch result details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (result_id) fetchResultDetail();
    }, [result_id]);

    // UI Memoized Stats
    const stats = useMemo(() => {
        if (!result) return null;
        return {
            perc: Math.round((result.score / result.totalMarks) * 100),
            status: (result.score / result.totalMarks) >= 0.5 ? 'PASSED' : 'FAILED'
        };
    }, [result]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#1E3A8A]">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white/70 mt-4 font-medium italic">Generating Report...</Text>
            </View>
        );
    }

    const { student, answers, totalMarks, score } = result;

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

                {/* PRESTIGE HEADER BLOCK */}
                <View className="bg-[#1E3A8A] pt-12 pb-24 px-6 rounded-b-[50px] shadow-2xl">
                    <View className="items-center mb-6">
                        <View className="bg-white/10 px-4 py-1 rounded-full mb-3">
                            <Text className="text-white text-[10px] font-bold tracking-[2px]">EXAM REPORT</Text>
                        </View>
                        <Text className="text-white text-3xl font-black text-center">{student.name}</Text>
                        <Text className="text-blue-200/60 text-sm font-medium">{student.email}</Text>
                    </View>

                    {/* GLASS STATS PODS */}
                    <View className="bg-white/10 border border-white/20 p-5 rounded-[32px] flex-row justify-between items-center shadow-2xl">
                        <View className="items-center flex-1">
                            <View className="bg-blue-400/20 w-10 h-10 rounded-xl items-center justify-center mb-2 border border-blue-300/20">
                                <Text className="text-lg">🎯</Text>
                            </View>
                            <Text className="text-white text-lg font-black">{score}/{totalMarks}</Text>
                            <Text className="text-blue-200/50 text-[9px] font-bold uppercase tracking-wider">Score</Text>
                        </View>

                        <View className="w-[1px] h-10 bg-white/10" />

                        <View className="items-center flex-1">
                            <View className="bg-emerald-400/20 w-10 h-10 rounded-xl items-center justify-center mb-2 border border-emerald-300/20">
                                <Text className="text-lg">⚡</Text>
                            </View>
                            <Text className="text-white text-lg font-black">{stats?.perc}%</Text>
                            <Text className="text-blue-200/50 text-[9px] font-bold uppercase tracking-wider">Accuracy</Text>
                        </View>

                        <View className="w-[1px] h-10 bg-white/10" />

                        <View className="items-center flex-1">
                            <View className={`w-10 h-10 rounded-xl items-center justify-center mb-2 border ${stats?.status === 'PASSED' ? 'bg-green-500/20 border-green-400/30' : 'bg-red-500/20 border-red-400/30'}`}>
                                <Text className="text-xs font-black text-white">{stats?.status === 'PASSED' ? '✓' : '✕'}</Text>
                            </View>
                            <Text className="text-white text-lg font-black">{stats?.status}</Text>
                            <Text className="text-blue-200/50 text-[9px] font-bold uppercase tracking-wider">Result</Text>
                        </View>
                    </View>
                </View>

                {/* ANSWERS LIST */}
                <View className="px-5 -mt-12 pb-12">
                    <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4 ml-2">Question Analysis</Text>

                    {answers.map((ans: any, index: number) => {
                        const q = ans.question;
                        const selectedOption = q?.options?.[ans.selectedOption];
                        const correctOption = q?.options?.find((opt: any) => opt.isCorrect);

                        return (
                            <View key={ans._id} className="bg-white rounded-[30px] mb-5 overflow-hidden shadow-sm border border-slate-100 flex-row">

                                {/* Status Accent Side-Bar */}
                                <View className={`w-2 ${ans.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                                <View className="flex-1 p-5">
                                    <View className="flex-row justify-between items-center mb-3">
                                        <Text className="text-slate-400 font-bold text-[10px] uppercase">Question {index + 1}</Text>
                                        <View className={`px-3 py-1 rounded-full ${ans.isCorrect ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                            <Text className={`text-[9px] font-black ${ans.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {ans.isCorrect ? 'CORRECT' : 'INCORRECT'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text className="text-slate-800 text-[15px] font-bold leading-6 mb-4">
                                        {q.questionText}
                                    </Text>

                                    {/* Choice Details */}
                                    <View className="space-y-2">
                                        <View className={`p-3 rounded-2xl border-2 ${ans.isCorrect ? 'border-emerald-500/10 bg-emerald-50/30' : 'border-rose-500/10 bg-rose-50/30'}`}>
                                            <Text className="text-[9px] font-bold text-slate-400 uppercase mb-1">Your Selection</Text>
                                            <Text className={`text-sm font-semibold ${ans.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                                                {selectedOption?.text ?? 'No response provided'}
                                            </Text>
                                        </View>

                                        {!ans.isCorrect && (
                                            <View className="p-3 rounded-2xl border-2 border-[#1E3A8A]/10 bg-[#1E3A8A]/5">
                                                <Text className="text-[9px] font-bold text-[#1E3A8A]/50 uppercase mb-1">Correct Answer</Text>
                                                <Text className="text-sm font-semibold text-[#1E3A8A]">
                                                    {correctOption?.text}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default StudentResultDetail;