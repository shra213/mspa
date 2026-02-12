import api from "@/api";
import {
    ArrowLeft,
    BookOpen,
    LayoutGrid
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Active from "../Active";
import Myresult from "../Myresult";

export default function StudentTests() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"tests" | "results">("tests");
    const [loading, setLoading] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    /* ================= FETCH SUBJECTS ================= */
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await api.get("/user/enrollments");
                setSubjects(res?.data?.enrolled || []);
            } catch (e) {
                console.log("Subject fetch error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    /* ================= ANIMATION ================= */
    useEffect(() => {
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, [selectedSubject, activeTab]);

    /* ================= LOADER ================= */
    if (loading) {
        return (
            <View className="flex-1 bg-[#F5F7FA] items-center justify-center">
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text className="text-slate-400 mt-3 font-semibold">
                    Loading subjects...
                </Text>
            </View>
        );
    }

    /* ================= SUBJECT LIST ================= */
    if (!selectedSubject) {
        return (
            <SafeAreaView edges={["top"]} className="flex-1 bg-[#1E3A8A]">
                <View className="flex-1 bg-[#F5F7FA]">
                    <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

                    {/* HEADER */}
                    <View className="bg-[#1E3A8A] px-8 pt-10 pb-20 rounded-bl-[70px]">
                        <View className="flex-row justify-between items-center">
                            <View className="bg-white/10 p-3 rounded-2xl">
                                <LayoutGrid size={22} color="white" />
                            </View>

                            {/* <View className="bg-emerald-400 px-4 py-1 rounded-full">
                            <Text className="text-white text-[10px] font-black tracking-widest">
                                LIVE
                            </Text>
                        </View> */}
                        </View>

                        <Text className="text-white/60 mt-10 text-xs font-bold tracking-widest uppercase">
                            Enrolled Subjects
                        </Text>
                        <Text className="text-white text-4xl font-black mt-1">
                            My Subjects
                        </Text>
                    </View>

                    {/* SUBJECT CARDS */}
                    <ScrollView
                        className="flex-1 -mt-12 py-3 px-6"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        {subjects.length === 0 ? (
                            <View className="items-center mt-20">
                                <BookOpen size={50} color="#CBD5E1" />
                                <Text className="text-slate-400 font-bold mt-4">
                                    No subjects enrolled
                                </Text>
                            </View>
                        ) : (
                            <Animated.View
                                style={{
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                }}
                                className="flex-row flex-wrap justify-between"
                            >
                                {subjects.map((item) => (
                                    <Pressable
                                        key={item._id}
                                        onPress={() => setSelectedSubject(item.subject)}
                                        style={({ pressed }) => [
                                            {
                                                transform: [{ scale: pressed ? 0.97 : 1 }],
                                            },
                                        ]}
                                        className="bg-white w-[48%] p-5 rounded-[30px] mb-4 shadow border border-slate-100"
                                    >
                                        <View className="bg-blue-100 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                                            <BookOpen size={22} color="#1E3A8A" />
                                        </View>

                                        <Text
                                            className="text-slate-900 font-extrabold text-lg leading-tight"
                                            numberOfLines={2}
                                        >
                                            {item.subject.name}
                                        </Text>

                                        <Text
                                            className="text-slate-400 text-xs font-semibold mt-2"
                                            numberOfLines={1}
                                        >
                                            {item.subject.teacher.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </Animated.View>
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }

    /* ================= SUBJECT DETAIL ================= */
    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-[#1E3A8A]">

            <View className="flex-1 bg-[#F5F7FA]">
                {/* <StatusBar barStyle="light-content" /> */}
                <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
                {/* HEADER */}
                <View className="bg-[#1E3A8A] px-4 pb-8 rounded-b-[42px]">
                    {/* TOP ROW */}
                    <View className=" flex-row items-center justify-between mb-3">
                        <Pressable
                            onPress={() => setSelectedSubject(null)}
                            className="bg-white/15 p-2.5 rounded-xl"
                        >
                            <ArrowLeft size={20} color="white" />
                        </Pressable>

                        {/* SUBJECT BADGE */}
                        <View className="bg-white/15 px-3 py-1 rounded-full">
                            <Text className="text-white/80 text-[10px] font-bold tracking-widest">
                                SUBJECT
                            </Text>
                        </View>
                    </View>

                    {/* TITLE AREA */}
                    <View className="items-center px-6">
                        <Text
                            className="text-white text-[26px] font-black text-center leading-tight"
                            numberOfLines={2}
                        >
                            {selectedSubject.name}
                        </Text>

                        {/* SUB DIVIDER */}
                        <View className="w-10 h-[2px] bg-white/30 rounded-full mt-2 mb-2" />

                        <Text className="text-white/70 text-xs font-semibold tracking-wide">
                            {selectedSubject.teacher.name}
                        </Text>
                    </View>
                </View>


                {/* TABS */}
                <View className="flex-row px-10 mt-8">
                    {["tests", "results"].map((tab) => (
                        <Pressable
                            key={tab}
                            onPress={() => setActiveTab(tab as any)}
                            className="mr-10"
                        >
                            <Text
                                className={`text-lg font-black ${activeTab === tab
                                    ? "text-slate-900"
                                    : "text-slate-300"
                                    }`}
                            >
                                {tab.toUpperCase()}
                            </Text>
                            {activeTab === tab && (
                                <View className="h-1 w-6 bg-blue-600 rounded-full mt-1" />
                            )}
                        </Pressable>
                    ))}
                </View>

                {/* CONTENT */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                    className="flex-1 px-8 mt-6"
                >
                    {activeTab === "tests" ? (
                        <Active subjectId={selectedSubject._id} />
                    ) : (
                        <Myresult subjectId={selectedSubject._id} />
                    )}
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}
