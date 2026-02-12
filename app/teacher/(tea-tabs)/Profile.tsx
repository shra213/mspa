import api from "@/api";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { BookOpen, LogOut } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

/* ===================== */
/* ==== TEACHER PROFILE ==== */
/* ===================== */

export default function Profile() {
    const { user, loading, logout } = useAuth();
    const [add, setAdd] = useState(false);
    const [openSection, setOpenSection] = useState<
        "profile" | "subjects" | "enrolled" | "pending" | null
    >(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;
    const logoutScale = useRef(new Animated.Value(1)).current;
    const [newSubject, setNewSubject] = useState("");
    const [adding, setAdding] = useState(false);

    const [subjects, setSubjects] = useState<
        { name: string; code?: string }[]
    >([]);

    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [pendingStudents, setPendingStudents] = useState<any[]>([]);

    /* ---------------- FETCH DATA ---------------- */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsRes, studentsRes] = await Promise.all([
                    api.get("/tests/list-subjects"),
                    api.get("/user/pending"),
                ]);
                console.log(subjectsRes.data);

                setSubjects(
                    Array.isArray(subjectsRes.data)
                        ? subjectsRes.data.map((s: any) => ({
                            name: s.name,
                            code: s.code,
                        }))
                        : []
                );

                console.log(studentsRes.data);
                setEnrolledStudents(studentsRes.data.enrolled || []);
                setPendingStudents(studentsRes.data || []);
            } catch (err) {
                console.log("Teacher profile fetch error:", err);
            }
        };

        if (user?.role === "teacher") fetchData();
    }, [user]);

    /* ---------------- ENTRY ANIMATION ---------------- */
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <LottieView
                    source={require("../../../assets/animations/Loading 40 _ Paperplane (1).json")}
                    autoPlay
                    loop
                    style={{ width: 140, height: 140 }}
                />
                <Text className="text-slate-500 mt-2 text-base">
                    Preparing your profile…
                </Text>
            </View>
        );
    }
    async function acceptStudent(requestId: string) {
        try {
            await api.post("/user/accept", { enrollmentId: requestId });

            // remove from pending list (instant UI update)
            setPendingStudents((prev) =>
                prev.filter((req) => req._id !== requestId)
            );
        } catch (err) {
            console.log("Accept student error:", err);
        }
    }

    async function addSubject(name: string) {
        if (!name.trim()) return;

        try {
            setAdding(true);

            const res = await api.post("/tests/addSubject", {
                subject: name,
            });
            console.log(res.data);
            // optimistic UI update
            setSubjects((prev) => [
                ...prev,
                {
                    name: res.data.name,
                    code: res.data.code,
                },
            ]);
            setNewSubject("");
        } catch (err) {
            console.log("Add subject error:", err);
        } finally {
            setAdding(false);
        }
    }

    return (
        <View className="flex-1 bg-slate-50">

            {/* ===== FIXED HEADER (Same as Student) ===== */}
            <CurvedHeader>
                <View className="bg-white rounded-full p-2 shadow-xl">
                    <LottieView
                        source={require("../../../assets/animations/Profile Avatar of Young Boy.json")}
                        autoPlay
                        loop
                        style={{ width: 130, height: 130 }}
                    />
                </View>
                <Text className="mt-2 text-2xl font-extrabold text-indigo-950">
                    {user?.name || "Teacher"}
                </Text>
            </CurvedHeader>

            {/* ===== SCROLLABLE CONTENT ===== */}
            <View className="flex-1 px-6 mt-3">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >

                        {/* ===== PROFILE CARD ===== */}
                        <CollapsibleCard
                            title="Profile Information"
                            subtitle="Your basic details"
                            isOpen={openSection === "profile"}
                            onToggle={() =>
                                setOpenSection(openSection === "profile" ? null : "profile")
                            }
                        >
                            <InfoRow label="Name" value={user?.name} />
                            <InfoRow label="Email" value={user?.email} />
                            <InfoRow label="Role" value={user?.role} capitalize />
                        </CollapsibleCard>

                        {/* ===== SUBJECTS CARD ===== */}
                        <CollapsibleCard
                            title={`Subjects (${subjects.length})`}
                            subtitle="Manage your subjects"
                            isOpen={openSection === "subjects"}
                            onToggle={() => {
                                setOpenSection(openSection === "subjects" ? null : "subjects");
                                setAdd(false);
                            }}
                        >

                            {/* Add Subject Input */}
                            {add && (
                                <View className="bg-indigo-50/60 rounded-2xl px-4 py-4 mb-5 flex-row items-center gap-2">
                                    <View className="flex-1 bg-white rounded-xl px-4 border border-indigo-100">
                                        <TextInput
                                            value={newSubject}
                                            onChangeText={setNewSubject}
                                            placeholder="Subject name"
                                            className="h-10 text-sm"
                                        />
                                    </View>

                                    <Pressable
                                        disabled={adding}
                                        onPress={() => addSubject(newSubject)}
                                        className="bg-indigo-600 px-4 py-2 rounded-xl"
                                    >
                                        <Text className="text-white font-bold">Add</Text>
                                    </Pressable>
                                </View>
                            )}

                            {/* Subject List */}
                            {subjects.map((sub, i) => (
                                <RowPill
                                    key={i}
                                    title={sub.name}
                                    subtitle={sub.code ? `Code: ${sub.code}` : ""}
                                    badge="Active"
                                    badgeColor="bg-emerald-500"
                                    icon={<BookOpen size={14} color="white" />}
                                />
                            ))}

                            {!add && (
                                <Pressable
                                    onPress={() => setAdd(true)}
                                    className="bg-indigo-600 p-3 rounded-2xl mt-2"
                                >
                                    <Text className="text-white text-center font-bold">
                                        + Add Subject
                                    </Text>
                                </Pressable>
                            )}
                        </CollapsibleCard>

                        {/* ===== PENDING REQUESTS CARD ===== */}
                        <CollapsibleCard
                            title={`Pending Requests (${pendingStudents.length})`}
                            subtitle="Waiting for approval"
                            isOpen={openSection === "pending"}
                            onToggle={() =>
                                setOpenSection(openSection === "pending" ? null : "pending")
                            }
                        >
                            {pendingStudents.length ? (
                                pendingStudents.map((stu) => (
                                    <RowPill
                                        key={stu._id}
                                        title={stu.student?.name || "Student"}
                                        subtitle={stu.subject?.name}
                                        badge="Accept"
                                        badgeColor="bg-emerald-500"
                                        icon={<BookOpen size={14} color="white" />}
                                    />
                                ))
                            ) : (
                                <EmptyState text="No pending requests" />
                            )}
                        </CollapsibleCard>

                        {/* ===== LOGOUT ===== */}
                        <Pressable
                            onPress={async () => {
                                await logout();
                                router.replace("/");
                            }}
                            className="mt-4 bg-white border border-rose-100 py-4 rounded-2xl flex-row items-center justify-center shadow-sm"
                        >
                            <LogOut size={18} color="#F43F5E" />
                            <Text className="text-rose-500 font-bold ml-2">
                                Sign Out
                            </Text>
                        </Pressable>

                    </Animated.View>
                </ScrollView>
            </View>
        </View>
    );

}



// function addSubject(name: string) {

// }
/* ===================== */
/* ===== UI PARTS ===== */
/* ===================== */
function CollapsibleCard({
    title,
    subtitle,
    isOpen,
    onToggle,
    rightAction,
    children,
}: any) {
    const anim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        Animated.timing(anim, {
            toValue: isOpen ? 1 : 0,
            duration: 280,
            useNativeDriver: false, // height animation
        }).start();
    }, [isOpen]);

    const height = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, contentHeight],
    });

    return (
        <View className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden">
            {/* ---------- HEADER ---------- */}
            <Pressable
                onPress={onToggle}
                className="px-5 py-5 flex-row items-center justify-between"
            >
                <View>
                    <Text className="text-lg font-bold text-indigo-950">
                        {title}
                    </Text>
                    {subtitle && (
                        <Text className="text-xs text-slate-400 mt-0.5">
                            {subtitle}
                        </Text>
                    )}
                </View>

                <View className="flex-row items-center gap-3">
                    {rightAction}
                    <Animated.Text
                        style={{
                            transform: [
                                {
                                    rotate: anim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ["0deg", "90deg"],
                                    }),
                                },
                            ],
                        }}
                        className="text-indigo-500 text-lg"
                    >
                        ▶
                    </Animated.Text>
                </View>
            </Pressable>

            {/* ---------- MEASURER (hidden) ---------- */}
            <View
                style={{
                    position: "absolute",
                    opacity: 0,
                    zIndex: -1,
                }}
                onLayout={(e) => {
                    const h = e.nativeEvent.layout.height;
                    if (h !== contentHeight) {
                        setContentHeight(h);
                    }
                }}
            >
                <View className="px-5 pb-5">{children}</View>
            </View>

            {/* ---------- ANIMATED CONTENT ---------- */}
            <Animated.View style={{ height, overflow: "hidden" }}>
                <View className="px-5 pb-5">{children}</View>
            </Animated.View>
        </View>
    );
}

function CurvedHeader({ children }: any) {
    return (
        <View style={{ height: 260 }}>
            <View
                style={{
                    height: 180,
                    backgroundColor: "#1E3A8A",
                    borderBottomLeftRadius: 160,
                    borderBottomRightRadius: 160,
                }}
            />
            <View
                style={{
                    position: "absolute",
                    top: 65,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                }}
            >
                {children}
            </View>
        </View>
    );
}

function InfoRow({ label, value, capitalize }: any) {
    return (
        <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm text-slate-500">{label}</Text>
            <Text
                className={`max-w-[75%] text-right text-sm font-semibold text-slate-800 ${capitalize ? "capitalize" : ""
                    }`}
            >
                {value || "-"}
            </Text>
        </View>
    );
}

function RowPill({
    title,
    subtitle,
    badge,
    badgeColor,
    icon,
    rightAction,
}: any) {
    return (
        <View className="mb-3">
            <View className="flex-row items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <View>
                    <Text className="text-sm font-bold text-slate-800">
                        {title}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                        {subtitle}
                    </Text>
                </View>

                {rightAction ? (
                    rightAction
                ) : (
                    <View className={`flex-row items-center px-3 py-1 rounded-full ${badgeColor}`}>
                        {icon && <View className="mr-1">{icon}</View>}
                        <Text className="text-white text-xs font-bold">
                            {badge}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

function EmptyState({ text }: any) {
    return (
        <Text className="text-sm text-slate-400 text-center mt-3">
            {text}
        </Text>
    );
}
