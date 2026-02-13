import api from "@/api";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { BookOpen, Clock, LogOut } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";

export default function Profile() {
    const { user, logout } = useAuth();
    const [openSection, setOpenSection] = useState<"profile" | "enrolled" | "pending" | null>(null);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    const [enrolled, setEnrolled] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrollOpen, setEnrollOpen] = useState(false);
    const [teacherCode, setTeacherCode] = useState("");
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const res = await api.get("/user/enrollments");
                setEnrolled(res?.data?.enrolled || []);
                setPending(res?.data?.requested || []);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchEnrollments();

        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, useNativeDriver: true }),
        ]).start();
    }, [user, requesting]);

    async function requestEnroll() {
        if (!teacherCode.trim()) return;
        try {

            console.log(teacherCode)
            setRequesting(true);
            const res = await api.post("/user/request", { code: teacherCode });
            if (res?.data?.request) setPending((prev) => [...prev, res.data.request]);
            setTeacherCode("");

            console.log(res.data)
            setEnrollOpen(false);
        } catch (err) {
            console.log(err);
        } finally {
            setRequesting(false);
        }
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#1E3A8A" />
            </View>
        );
    }

    return (
        // flex-1 here makes the whole screen a fixed container
        <View className="flex-1 bg-slate-50">

            {/* ===== FIXED HEADER ===== */}
            <CurvedHeader>
                <View className="bg-white rounded-full p-2 shadow-xl">
                    <LottieView
                        source={require("../../../assets/animations/Profile Avatar of Young Boy.json")}
                        autoPlay loop style={{ width: 130, height: 130 }}
                    />
                </View>
                <Text className="mt-2 text-2xl font-extrabold text-indigo-950">
                    {user?.name || "Student"}
                </Text>
            </CurvedHeader>

            {/* ===== SCROLLABLE CONTENT AREA ===== */}
            {/* flex-1 here ensures this view takes up the remaining space below the header */}
            <View className="flex-1 px-6 mt-3">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        {/* PROFILE CARD */}
                        <CollapsibleCard
                            title="Profile Information"
                            subtitle="Your basic details"
                            isOpen={openSection === "profile"}
                            onToggle={() => setOpenSection(openSection === "profile" ? null : "profile")}
                        >
                            <InfoRow label="Name" value={user?.name} />
                            <InfoRow label="Email" value={user?.email} />
                            <InfoRow label="Role" value={user?.role} capitalize />
                        </CollapsibleCard>

                        {/* ENROLLED CARD */}
                        <CollapsibleCard
                            title={`Enrolled Subjects (${enrolled.length})`}
                            subtitle="Currently learning"
                            isOpen={openSection === "enrolled"}
                            onToggle={() => {
                                setOpenSection(openSection === "enrolled" ? null : "enrolled");
                                setEnrollOpen(false);
                            }}
                        >
                            {enrollOpen && (
                                <View className="bg-indigo-50/60 rounded-2xl px-4 py-4 mb-5 flex-row items-center gap-2">
                                    <View className="flex-1 bg-white rounded-xl px-4 border border-indigo-100">
                                        <TextInput
                                            value={teacherCode}
                                            onChangeText={setTeacherCode}
                                            placeholder="Code"
                                            className="h-10 text-sm"
                                        />
                                    </View>
                                    <Pressable onPress={requestEnroll} className="bg-indigo-600 px-4 py-2 rounded-xl">
                                        <Text className="text-white font-bold">Send</Text>
                                    </Pressable>
                                </View>
                            )}
                            {enrolled.map((item) => (
                                <RowPill key={item._id} title={item?.subject?.name} subtitle={item?.subject?.teacher?.name} badge="Active" badgeColor="bg-emerald-500" icon={<BookOpen size={14} color="white" />} />
                            ))}
                            {!enrollOpen && (
                                <Pressable onPress={() => setEnrollOpen(true)} className="bg-indigo-600 p-3 rounded-2xl mt-2">
                                    <Text className="text-white text-center font-bold">+ Enroll</Text>
                                </Pressable>
                            )}
                        </CollapsibleCard>

                        {/* PENDING CARD */}
                        <CollapsibleCard
                            title={`Pending Requests (${pending.length})`}
                            isOpen={openSection === "pending"}
                            onToggle={() => setOpenSection(openSection === "pending" ? null : "pending")}
                        >
                            {pending.length ? pending.map((item) => (
                                <RowPill key={item._id} title={item?.subject?.name} subtitle={item?.subject?.teacher?.name} badge="Pending" badgeColor="bg-amber-500" icon={<Clock size={14} color="white" />} />
                            )) : <EmptyState text="No pending requests" />}
                        </CollapsibleCard>

                        {/* LOGOUT */}
                        <Pressable
                            onPress={async () => { await logout(); router.replace("/"); }}
                            className="mt-4 bg-white border border-rose-100 py-4 rounded-2xl flex-row items-center justify-center shadow-sm"
                        >
                            <LogOut size={18} color="#F43F5E" />
                            <Text className="text-rose-500 font-bold ml-2">Sign Out</Text>
                        </Pressable>

                    </Animated.View>
                </ScrollView>
            </View>
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

function CollapsibleCard({ title, subtitle, isOpen, onToggle, children }: any) {
    const anim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        Animated.timing(anim, {
            toValue: isOpen ? 1 : 0,
            duration: 280,
            useNativeDriver: false,
        }).start();
    }, [isOpen]);

    const height = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, contentHeight],
    });

    return (
        <View className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden">
            <Pressable
                onPress={onToggle}
                className="px-5 py-5 flex-row items-center justify-between"
            >
                <View>
                    <Text className="text-lg font-bold text-indigo-950">{title}</Text>
                    {subtitle && (
                        <Text className="text-xs text-slate-400 mt-0.5">{subtitle}</Text>
                    )}
                </View>

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
            </Pressable>

            <View
                style={{ position: "absolute", opacity: 0, zIndex: -1 }}
                onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
            >
                <View className="px-5 pb-5">{children}</View>
            </View>

            <Animated.View style={{ height, overflow: "hidden" }}>
                <View className="px-5 pb-5">{children}</View>
            </Animated.View>
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

function RowPill({ title, subtitle, badge, badgeColor, icon }: any) {
    return (
        <View className="mb-3">
            <View className="flex-row items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <View>
                    <Text className="text-sm font-bold text-slate-800">{title}</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">{subtitle}</Text>
                </View>

                <View className={`flex-row items-center px-3 py-1 rounded-full ${badgeColor}`}>
                    {icon && <View className="mr-1">{icon}</View>}
                    <Text className="text-white text-xs font-bold">{badge}</Text>
                </View>
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
