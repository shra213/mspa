import { backend } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ChevronUp, Clock, Target, Trophy, Users } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Pressable,
    StatusBar,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function TestResults() {
    const { testId } = useLocalSearchParams();
    const router = useRouter();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => { fetchResults(); }, [testId]);

    useEffect(() => {
        if (!loading) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        }
    }, [loading]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${backend}/dashboard/teacher/${testId}/dash`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res = await response.json();
            console.log(res)
            setData(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-[#1f346d]">
            <ActivityIndicator size="large" color="#ffffff" />
        </View>
    );

    const { leaderboard = [], testSummary } = data;
    const top3 = leaderboard.slice(0, 3).sort((a: any, b: any) => a.rank - b.rank);

    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-[#1f346d]">
            <View className="flex-1 bg-[#1f346d]">
                <StatusBar barStyle="light-content" backgroundColor="#1f346d" />

                {/* HEADER */}
                <View className="pt-6 pb-6 px-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Pressable onPress={() => router.back()} className="p-2 bg-white/10 rounded-full">
                            <ArrowLeft size={20} color="white" />
                        </Pressable>
                        <Text className="text-white font-bold text-lg tracking-widest uppercase">
                            Leaderboard
                        </Text>
                        <View className="w-10" />
                    </View>

                    <Top3Podium top3={top3} />
                </View>

                {/* BOTTOM SHEET */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [80, 0]
                            })
                        }]
                    }}
                    className="flex-1 bg-[#f4f7ff] rounded-t-[40px] overflow-hidden"
                >
                    <FlatList
                        data={leaderboard}
                        ListHeaderComponent={() => (
                            <View className="px-6 pt-8 pb-4">

                                {/* STATS */}
                                <View className="flex-row justify-between mb-8">
                                    <MiniStat
                                        icon={<Users size={16} color="#1f346d" />}
                                        label="Students"
                                        value={testSummary?.totalStudents}
                                    />
                                    <MiniStat
                                        icon={<Target size={16} color="#1f346d" />}
                                        label="Avg Score"
                                        value={testSummary?.avgScore}
                                    />
                                    <MiniStat
                                        icon={<Clock size={16} color="#1f346d" />}
                                        label="Avg Time"
                                        value={`${data?.timeAnalytics?.avgTime || 0}s`}
                                    />
                                </View>

                                <Text className="text-[#1f346d]/60 font-bold text-xs uppercase tracking-widest mb-4">
                                    Rankings
                                </Text>
                            </View>
                        )}
                        keyExtractor={(_, i) => i.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => <LeaderboardRow item={item} />}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    />
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

/* ===================== COMPONENTS ===================== */

function Top3Podium({ top3 }: { top3: any[] }) {
    const first = top3.find(s => s.rank === 1);
    const second = top3.find(s => s.rank === 2);
    const third = top3.find(s => s.rank === 3);

    return (
        <View className="flex-row justify-around items-end h-52 pb-4">

            {/* Rank 2 */}
            <PodiumCircle
                rank={2}
                name={second?.studentName}
                score={second?.score}
                size="medium"
            />

            {/* Rank 1 */}
            <View className="items-center w-1/3">
                <Trophy size={28} color="#fbbf24" fill="#fbbf24" />
                <PodiumCircle
                    rank={1}
                    name={first?.studentName}
                    score={first?.score}
                    size="large"
                    highlight
                />
            </View>

            {/* Rank 3 */}
            <PodiumCircle
                rank={3}
                name={third?.studentName}
                score={third?.score}
                size="small"
            />
        </View>
    );
}

function PodiumCircle({ rank, name, score, size, highlight }: any) {
    const sizes: any = {
        large: "w-24 h-24 border-4",
        medium: "w-16 h-16 border-2",
        small: "w-14 h-14 border-2",
    };

    return (
        <View className="items-center w-1/3">
            <View className={`${sizes[size]} rounded-full ${highlight ? 'border-amber-400 bg-[#2a458a]' : 'border-white/30 bg-[#2a458a]'} items-center justify-center`}>
                <Text className="text-white font-black text-lg">{rank}</Text>
            </View>
            <Text className="text-white font-semibold mt-2 text-xs" numberOfLines={1}>
                {name || "---"}
            </Text>
            <Text className="text-amber-300 font-bold text-[10px]">
                {score || 0} pts
            </Text>
        </View>
    );
}

function MiniStat({ icon, label, value }: any) {
    return (
        <View className="bg-white rounded-2xl w-[30%] p-4 items-center shadow-sm">
            {icon}
            <Text className="text-[10px] text-[#1f346d]/60 font-bold uppercase mt-2">
                {label}
            </Text>
            <Text className="text-[#1f346d] font-black text-sm mt-1">
                {value}
            </Text>
        </View>
    );
}

function LeaderboardRow({ item }: any) {
    const router = useRouter();
    const isTop3 = item.rank <= 3;

    return (
        <Pressable
            onPress={() => router.push(`/teacher/StudentResultDetail/${item.result_id}`)}
            className="flex-row items-center px-6 py-4 mx-4 mb-3 bg-white rounded-2xl shadow-sm"
        >
            <Text className={`font-black w-8 ${isTop3 ? 'text-[#1f346d]' : 'text-gray-400'}`}>
                {item.rank}
            </Text>

            <View className="w-10 h-10 rounded-full bg-[#e6ecff] items-center justify-center mr-3">
                <Text className="text-xs text-[#1f346d] font-bold uppercase">
                    {item.studentName?.substring(0, 2)}
                </Text>
            </View>

            <View className="flex-1">
                <Text className="text-[#1f346d] font-bold text-sm" numberOfLines={1}>
                    {item.studentName}
                </Text>
                <Text className="text-gray-400 text-[10px] font-medium italic">
                    Performance stable
                </Text>
            </View>

            <View className="items-end">
                <Text className="text-[#1f346d] font-black text-sm">
                    {item.score}
                </Text>
                <View className="flex-row items-center">
                    <ChevronUp size={12} color="#16a34a" />
                    <Text className="text-green-600 text-[10px] font-bold">
                        +{Math.floor(Math.random() * 5)}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}
