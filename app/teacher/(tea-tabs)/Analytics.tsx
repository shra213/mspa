import { backend } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
    ArrowLeft,
    BookOpen,
    LayoutGrid,
    Plus,
    Send,
    Trash2,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import api from "@/api";
import { useTeacherSubjects } from "@/hooks/h1";
import { useSubjectWiseTests } from "@/hooks/subTests";
import { SafeAreaView } from "react-native-safe-area-context";

function TeacherTestsList({ subjectId }: { subjectId: string }) {
    const { tests, loading, refetchTests } = useSubjectWiseTests(subjectId);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem("token").then(setToken);
    }, []);

    const handlePublish = async (id: string) => {
        try {
            await fetch(`${backend}/tests/${id}/publish`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            refetchTests();
        } catch (err) {
            console.error("PUBLISH FAILED", err);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Delete Test",
            "Are you sure you want to delete this test?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await fetch(`${backend}/tests/${id}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            refetchTests();
                        } catch (err) {
                            console.error("DELETE FAILED", err);
                        }
                    },
                },
            ]
        );
    };

    const isTestEnded = (test: any) => {
        if (test.status === "ended") return true;
        if (!test.createdAt) return false;

        const startTime = new Date(test.createdAt).getTime();
        const durationMinutes = parseInt(test.duration);
        const durationMs = durationMinutes * 60 * 1000;
        const endTime = startTime + durationMs;

        return Date.now() > endTime;
    };

    // Helper to format the Date and Time
    const formatDateTime = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) + " | " + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#1E3A8A" />;
    }

    if (!tests.length) {
        return (
            <Text className="text-slate-400 text-center mt-10">
                No tests created yet
            </Text>
        );
    }


    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {tests.map((test: any) => {
                const ended = isTestEnded(test);
                return (
                    <View
                        key={test._id}
                        className="bg-white p-6 rounded-[30px] mb-5 shadow-sm border border-slate-100"
                    >
                        {/* HEADER */}
                        <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1 mr-3">
                                <Text className="text-lg font-black text-slate-900 leading-tight">
                                    {test.title}
                                </Text>
                                {/* DATE AND TIME ADDED HERE */}
                                <Text className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tight">
                                    Created: {formatDateTime(test.createdAt)}
                                </Text>

                                <View className="flex-row items-center mt-3">
                                    <View className="bg-slate-100 px-2 py-1 rounded-md mr-2">
                                        <Text className="text-[10px] font-bold text-slate-500 uppercase">
                                            {test.questions?.length || 0} Questions
                                        </Text>
                                    </View>
                                    <View className="bg-slate-100 px-2 py-1 rounded-md">
                                        <Text className="text-[10px] font-bold text-slate-500 uppercase">
                                            {test.duration} Mins
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View
                                className={`px-3 py-1 rounded-full ${test.status === "published"
                                    ? "bg-emerald-100"
                                    : test.status === "ended"
                                        ? "bg-slate-200"
                                        : "bg-amber-100"
                                    }`}
                            >
                                <Text
                                    className={`text-[10px] font-black uppercase tracking-tighter ${test.status === "published"
                                        ? "text-emerald-700"
                                        : test.status === "ended"
                                            ? "text-slate-700"
                                            : "text-amber-700"
                                        }`}
                                >
                                    {ended
                                        ? "● Ended"
                                        : test.status === "published"
                                            ? "● Published"
                                            : "● Draft"}
                                </Text>
                            </View>
                        </View>

                        <View className="h-[1px] bg-slate-50 w-full my-2" />

                        {/* ACTIONS */}
                        <View className="mt-3 gap-y-2">
                            {/* DRAFT ACTIONS */}
                            {test.status !== "published" && !ended && (
                                <View className="flex-row gap-x-2">
                                    <TouchableOpacity
                                        className="flex-1 flex-row justify-center items-center py-3 rounded-2xl bg-indigo-50 border border-indigo-100"
                                        onPress={() =>
                                            router.push(`/teacher/Add/${test._id}`)
                                        }
                                    >
                                        <Plus size={16} color="#4f46e5" />
                                        <Text className="text-indigo-600 font-bold text-sm ml-2">
                                            Edit
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-1 flex-row justify-center items-center py-3 rounded-2xl bg-indigo-600 shadow-md shadow-indigo-200"
                                        onPress={() => handlePublish(test._id)}
                                    >
                                        <Send size={14} color="white" />
                                        <Text className="text-white font-bold text-sm ml-2">
                                            Publish Now
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* LIVE BUTTON */}
                            {test.status === "published" &&
                                test.type === "teacher_controlled" &&
                                !ended && (
                                    <TouchableOpacity
                                        className="flex-row justify-center items-center py-4 rounded-2xl bg-orange-500 shadow-lg shadow-orange-200"
                                        onPress={() =>
                                            router.push({
                                                pathname: "/teacher/LiveTest",
                                                params: { testId: test._id },
                                            })
                                        }
                                    >
                                        <ActivityIndicator
                                            size="small"
                                            color="white"
                                            className="mr-2"
                                        />
                                        <Text className="text-white font-black uppercase tracking-widest text-xs">
                                            Launch Live Session
                                        </Text>
                                    </TouchableOpacity>
                                )}

                            {/* TEST ENDED MESSAGE */}
                            {test.type === "teacher_controlled" && ended && (
                                <View className="flex-row justify-center items-center py-4 rounded-2xl bg-slate-300">
                                    <Text className="text-slate-700 font-black uppercase tracking-widest text-xs">
                                        Test Ended
                                    </Text>
                                </View>
                            )}

                            {/* RESULTS + DELETE */}
                            {test.status === "published" || test.status === "ended" && (
                                <View className="flex-row gap-x-2">
                                    <TouchableOpacity
                                        onPress={() =>
                                            router.push(
                                                `/teacher/TestResult/${test._id}`
                                            )
                                        }
                                        className="flex-1 flex-row justify-center items-center py-3 rounded-2xl bg-emerald-50 border border-emerald-100"
                                    >
                                        <Text className="text-emerald-700 font-bold text-sm ml-2">
                                            Results
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleDelete(test._id)}
                                        className="p-3 rounded-2xl bg-red-50 border border-red-100"
                                    >
                                        <Trash2 size={18} color="#dc2626" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}

export default function TeacherTests() {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [activeTab, setActiveTab] =
        useState<"tests" | "students">("tests");

    const { subjects, loading, fetchSubjects } = useTeacherSubjects(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        slideAnim.setValue(20);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [subjects, selectedSubject, activeTab]);

    useEffect(() => {
        console.log("refre")
        fetchSubjects();
    }, [activeTab]);
    const [students, setStudents] = useState([]);

    const fetchStudents = async (subjectId: any) => {
        try {
            const res = await api.get(`/tests/subject/${subjectId}/students`);
            console.log(res.data);
            setStudents(res.data.students);
        } catch (e) {
            console.log(e)
            return;
        }
    }
    const handleRemoveStudent = (studentId: string) => {
        Alert.alert(
            "Remove Student",
            "Are you sure you want to remove this student from the subject?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(
                                `/tests/subject/${selectedSubject._id}/students/${studentId}`
                            );

                            // remove from local state instantly
                            setStudents((prev: any) =>
                                prev.filter((s: any) => s._id !== studentId)
                            );
                        } catch (error) {
                            console.log(error);
                            Alert.alert("Error", "Failed to remove student");
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        if (activeTab === "students" && selectedSubject?._id) {
            fetchStudents(selectedSubject._id);
        }
    }, [activeTab, selectedSubject]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F5F7FA]">
                <ActivityIndicator size="large" color="#1E3A8A" />
            </View>
        );
    }

    if (!selectedSubject) {
        return (
            <SafeAreaView edges={["top"]} className="flex-1 bg-[#1E3A8A]">
                <View className="flex-1 bg-[#F5F7FA] ">
                    <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

                    <View className="bg-[#1E3A8A] px-8 pt-10 pb-20 rounded-bl-[70px]">
                        <View className="flex-row justify-between items-center">
                            <View className="bg-white/10 p-3 rounded-2xl">
                                <LayoutGrid size={22} color="white" />
                            </View>
                        </View>

                        <Text className="text-white/60 mt-10 text-xs font-bold tracking-widest uppercase">
                            Teaching Dashboard
                        </Text>
                        <Text className="text-white text-4xl font-black mt-1">
                            My Subjects
                        </Text>
                    </View>

                    <ScrollView className="-mt-12 px-6">
                        <Animated.View
                            style={{
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            }}
                            className="flex-row flex-wrap justify-between"
                        >
                            {subjects.map((item: any) => (
                                <Pressable
                                    key={item._id}
                                    onPress={() => setSelectedSubject(item)}
                                    className="bg-white w-[48%] p-5 rounded-[30px] mb-4 border border-slate-100"
                                >
                                    <View className="bg-blue-100 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                                        <BookOpen size={22} color="#1E3A8A" />
                                    </View>

                                    <Text className="font-extrabold text-lg">
                                        {item.name}
                                    </Text>

                                    <Text className="text-xs text-slate-400 mt-2">
                                        Code: {item.code}
                                    </Text>
                                </Pressable>
                            ))}
                        </Animated.View>
                    </ScrollView>
                </View>
            </SafeAreaView >
        );
    }

    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-[#1E3A8A]">
            <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

            <View className=" flex-1 bg-[#F5F7FA] ">
                <View className="bg-[#1E3A8A] px-4 pb-8 rounded-b-[42px]">
                    <View className=" flex-row justify-between items-center mb-3">
                        <Pressable
                            onPress={() => setSelectedSubject(null)}

                            className="bg-white/20 border border-white/30 px-4 py-2 flex-row items-center rounded-2xl"
                        >
                            <ArrowLeft size={16} color="white" />
                            {/* <Text className="text-white font-bold ml-2 text-xs"></Text> */}
                        </Pressable>
                        {/* UPDATED CREATE BUTTON UI: CLEANER WHITE-GLASS STYLE */}
                        <Pressable
                            onPress={() =>
                                router.push({
                                    pathname: "/teacher/CreateTest",
                                    params: { subjectId: selectedSubject._id },
                                })
                            }
                            className="bg-white/20 border border-white/30 px-4 py-2 flex-row items-center rounded-2xl"
                        >
                            <Plus size={16} color="white" />
                            {/* <Text className="text-white font-bold ml-2 text-xs"></Text> */}
                        </Pressable>
                    </View>

                    <Text className="text-white text-[26px] font-black text-center">
                        {selectedSubject.name}
                    </Text>
                </View>

                {/* TABS */}
                <View className="flex-row px-10 mt-8">
                    {["tests", "students"].map((tab) => (
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

                {activeTab === "tests" ? (
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                        className="flex-1 px-8 mt-6"
                    >
                        <TeacherTestsList subjectId={selectedSubject._id} />
                    </Animated.View>
                ) : (
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                        className="flex-1 px-6 mt-6"
                    >
                        {students && students.length > 0 ? (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {students.map((student: any) => (
                                    <TouchableOpacity
                                        key={student._id}
                                        activeOpacity={0.9}
                                        onLongPress={() => handleRemoveStudent(student._id)}
                                        delayLongPress={400}
                                        className="bg-white p-5 rounded-[28px] mb-4 border border-slate-100 shadow-sm"
                                    >
                                        <View
                                            key={student._id}
                                            className="bg-white p-5 rounded-[28px] mb-4 border border-slate-100 shadow-sm"
                                        >
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-1">
                                                    <Text className="text-lg font-extrabold text-slate-900">
                                                        {student.name}
                                                    </Text>

                                                    <Text className="text-xs text-slate-400 mt-1">
                                                        {student.email}
                                                    </Text>
                                                </View>

                                                <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                                    <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                                        Enrolled
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : (
                            <View className="flex-1 items-center justify-center">
                                <View className="bg-white px-10 py-8 rounded-[30px] border border-slate-100">
                                    <Text className="text-3xl font-black text-slate-900 text-center">
                                        0
                                    </Text>
                                    <Text className="text-slate-400 font-bold mt-2 text-center uppercase tracking-wider text-xs">
                                        No Students Enrolled
                                    </Text>
                                </View>
                            </View>
                        )}
                    </Animated.View>
                )}

            </View>
        </SafeAreaView >
    );
}