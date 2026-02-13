import api from "@/api";
import { useAuth } from "@/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { BookOpen, GraduationCap, KeyRound, Lock, Mail, User } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
export default function AuthScreen() {
    const { role } = useLocalSearchParams();
    const { login, register } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, [isLogin]);

    const sendOtp = async () => {
        if (!email) return Alert.alert("Error", "Enter email first");
        try {
            setLoading(true);
            await api.post("/auth/sendOtp", { email });

            setOtpSent(true);
            setResendTimer(60);
            Alert.alert("Success", "OTP sent to your email");
        } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || "OTP failed");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpAndRegister = async () => {
        if (!otp) return Alert.alert("Error", "Enter OTP");
        try {
            setLoading(true);
            await register(name, email, password, role as string, otp);
            Alert.alert("Success", "Signup successful");
            setIsLogin(true);
            setOtpSent(false);
        } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        console.log("login")
        try {
            setLoading(true);
            const data = await login(email, password);
            console.log(data.user.role);
            if (role !== data.user.role) {
                Alert.alert("you are not")
                return;
            }
            console.log("success after login")
            router.replace(
                role === "student"
                    ? "/student/(stu-tabs)/Profile"
                    : "/teacher/(tea-tabs)/Analytics"
            );
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        setLoading(true);
        if (isLogin) return handleLogin();
        if (otpSent) return verifyOtpAndRegister();
        return sendOtp();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-indigo-50"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/* --- BACK BUTTON --- */}
                <View
                    className="mt-12 ml-6 p-2 w-10 h-10"
                >
                    {/* <ChevronLeft size={20} color="#4F46E5" /> */}
                </View>

                <View className="flex-col justify-center align-middle">
                    <View className="px-8 pt-4 pb-10">
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                            {/* --- HEADER --- */}
                            <View className="items-center mb-10">
                                <View className="bg-white p-5 rounded-3xl shadow-sm border border-indigo-100">
                                    {role === "student" ? (
                                        <BookOpen size={32} color="#4338ca" strokeWidth={2} />
                                    ) : (
                                        <GraduationCap size={32} color="#4338ca" strokeWidth={2} />
                                    )}
                                </View>
                                <Text className="text-2xl font-semibold text-[#1E1B4B] mt-6 tracking-widest">
                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                </Text>
                                <Text className="text-slate-500 mt-2 text-sm text-center">
                                    {isLogin ? `Log in to your ${role} dashboard` : `Join us as a ${role} today`}
                                </Text>
                            </View>

                            {/* --- FORM FIELDS --- */}
                            <View className="space-y-4">
                                {!isLogin && !otpSent && (
                                    <View className="flex-row items-center bg-white rounded-2xl border border-indigo-100 px-4 mb-4">
                                        <User size={18} color="#94a3b8" />
                                        <TextInput
                                            placeholder="Full Name"
                                            placeholderTextColor="#94a3b8"
                                            value={name}
                                            onChangeText={setName}
                                            className="flex-1 h-14 ml-3 text-[#1E1B4B] text-base"
                                        />
                                    </View>
                                )}

                                <View className="flex-row items-center bg-white rounded-2xl border border-indigo-100 px-4 mb-4">
                                    <Mail size={18} color="#94a3b8" />
                                    <TextInput
                                        placeholder="Email Address"
                                        placeholderTextColor="#94a3b8"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        className="flex-1 h-14 ml-3 text-[#1E1B4B] text-base -tracking-tighter"
                                    />
                                </View>

                                {!otpSent && (
                                    <View className="flex-row items-center bg-white rounded-2xl border border-indigo-100 px-4 mb-4">
                                        <Lock size={18} color="#94a3b8" />
                                        <TextInput
                                            placeholder="Password"
                                            placeholderTextColor="#94a3b8"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry
                                            className="flex-1 h-14 ml-3 text-[#1E1B4B] text-base"
                                        />
                                    </View>
                                )}

                                {!isLogin && otpSent && (
                                    <View className="bg-white rounded-2xl border-2 border-indigo-500 px-4 mb-4">
                                        <View className="flex-row items-center">
                                            <KeyRound size={18} color="#6366f1" />
                                            <TextInput
                                                placeholder="OTP"
                                                placeholderTextColor="#94a3b8"
                                                value={otp}
                                                onChangeText={setOtp}
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                className="flex-1 h-14 ml-3 text-indigo-900 font-bold text-lg tracking-[12px]"
                                            />
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* --- PRIMARY BUTTON --- */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleAction}
                                disabled={loading}
                                className={`h-16 mt-6 rounded-2xl items-center justify-center shadow-sm mt-2 ${loading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-semibold text-base tracking-widest">
                                        {isLogin ? "Sign In" : otpSent ? "Complete Registration" : "Get Started"}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* --- FOOTER ACTIONS --- */}
                            <View className="mt-8">
                                {!isLogin && otpSent && (
                                    <Pressable disabled={resendTimer > 0} onPress={() => { }} className="mb-6">
                                        <Text className={`text-center font-medium text-sm ${resendTimer > 0 ? 'text-slate-400' : 'text-indigo-600'}`}>
                                            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive a code? Resend"}
                                        </Text>
                                    </Pressable>
                                )}

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        setIsLogin(!isLogin);
                                        setOtpSent(false);
                                    }}
                                    className="bg-indigo-100/50 py-4 rounded-2xl border border-indigo-100"
                                >
                                    <Text className="text-center text-slate-600 text-sm tracking-widest">
                                        {isLogin ? "New to MSPA? " : "Already registered? "}
                                        <Text className="text-indigo-600 font-bold">{isLogin ? "Create Account" : "Login"}</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}