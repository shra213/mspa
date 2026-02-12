import { backend } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MyResults({ subjectId }: { subjectId: any }) {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (!token) return;

                const res = await fetch(
                    `${backend}/results/subject/${subjectId}/my-results`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!res.ok) throw new Error("Failed to fetch results");

                const data = await res.json();
                const sorted = data.sort(
                    (a: any, b: any) =>
                        new Date(b.submittedAt).getTime() -
                        new Date(a.submittedAt).getTime()
                );

                setResults(sorted);
            } catch (err: any) {
                console.log("Error fetching results:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [subjectId]);

    const stats = useMemo(() => {
        if (results.length === 0) return null;
        const avg = results.reduce((sum, r) => sum + (r.score / r.totalMarks) * 100, 0) / results.length;
        return { total: results.length, average: Math.round(avg) };
    }, [results]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#f8fafc]">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-3 text-slate-500 font-medium">Analyzing data...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* --- Performance Summary (Matches Test Tab Meta Style) --- */}
                {/* {stats && (
                    <View className="flex-row mb-8 space-x-4">
                        <View className="flex-1 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm border-l-4 border-l-slate-300">
                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Tests</Text>
                            <Text className="text-2xl font-black text-slate-900 mt-1">{stats.total}</Text>
                        </View>
                        <View className="flex-1 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm border-l-4 border-l-blue-600">
                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Avg. Score</Text>
                            <Text className="text-2xl font-black text-blue-600 mt-1">{stats.average}%</Text>
                        </View>
                    </View>
                )} */}

                {/* <Text className="text-slate-900 text-lg font-bold mb-4">Past Submissions</Text> */}

                {results.length === 0 ? (
                    <View className="py-10 items-center">
                        <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
                        <Text className="text-slate-400 mt-2 text-sm">No results found for this subject.</Text>
                    </View>
                ) : (
                    results.map((r) => {
                        const percentage = (r.score / r.totalMarks) * 100;
                        const isPassed = percentage >= 40;

                        return (
                            <TouchableOpacity
                                key={r._id}
                                activeOpacity={0.8}
                                onPress={() => router.push({ pathname: "/student/ResultDetail", params: { id: r._id } })}
                                className="bg-white rounded-2xl p-5 mb-4 border border-slate-100 shadow-sm"
                            >
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-1 mr-3">
                                        <Text className="text-[17px] font-bold text-slate-900" numberOfLines={1}>
                                            {r.test.title}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                                            <Text className="text-[11px] text-slate-400 ml-1">
                                                {new Date(r.submittedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Auto-Submit Badge */}
                                    {r.autoSubmitted && (
                                        <View className="bg-amber-50 px-2 py-1 rounded-md">
                                            <Text className="text-amber-700 text-[9px] font-black uppercase">Timed Out</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Score Visualization */}
                                <View className="flex-row items-end justify-between mb-2">
                                    <View className="flex-row items-baseline">
                                        <Text className={`text-2xl font-black ${isPassed ? 'text-slate-900' : 'text-rose-500'}`}>
                                            {r.score}
                                        </Text>
                                        <Text className="text-slate-400 text-sm font-medium"> / {r.totalMarks}</Text>
                                    </View>
                                    <Text className="text-sm font-bold text-slate-600">{Math.round(percentage)}%</Text>
                                </View>

                                {/* Progress Bar */}
                                <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <View
                                        className={`h-full rounded-full ${isPassed ? 'bg-blue-600' : 'bg-rose-400'}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </View>

                                <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                    <View className="flex-row items-center">
                                        <View className={`w-2 h-2 rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <Text className={`ml-2 text-[11px] font-bold uppercase tracking-tighter ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {isPassed ? 'Cleared' : 'Below Average'}
                                        </Text>
                                    </View>
                                    <Text className="text-blue-600 font-bold text-xs">Analysis Details →</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}