import AppLoader from "@/components/BooksAnimation";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { BookOpen, GraduationCap } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import "../global.css";

/* ================= ROLE CARD ================= */
function RoleCard({
  title,
  subtitle,
  icon,
  onPress,
  primary,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`flex-row items-center p-5 rounded-2xl mb-4 ${primary
        ? "bg-indigo-600"
        : "bg-white border border-indigo-200"
        }`}
    >
      <View
        className={`h-12 w-12 rounded-xl items-center justify-center ${primary ? "bg-white/20" : "bg-indigo-50"
          }`}
      >
        {icon}
      </View>

      <View className="ml-4 flex-1">
        <Text
          className={`text-base font-semibold ${primary ? "text-white" : "text-[#1E1B4B]"
            }`}
        >
          {title}
        </Text>
        <Text
          className={`text-sm mt-0.5 ${primary ? "text-indigo-100" : "text-slate-500"
            }`}
        >
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ================= AUTH REDIRECT + GUARD ================= */
function AppEntry() {




  // return <AppStateGuard />;
}

/* ================= APP STATE GUARD ================= */


/* ================= HOME SCREEN ================= */
export default function Home() {
  const [ready, setReady] = useState(false);
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && user) {
      router.replace(
        user.role === "student"
          ? "/student/(stu-tabs)/Profile"
          : "/teacher/(tea-tabs)/Analytics"
      );
    }
  }, [loading, user]);

  // Splash delay
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Animations
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslate = useRef(new Animated.Value(20)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnTranslate = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (!ready) return;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(brandTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(btnOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(btnTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [ready]);

  if (!ready) return <AppLoader />;
  if (loading) return <AppLoader />;

  if (user) {
    return null; // redirecting
  }

  return (
    <>

      <View className="flex-1 justify-center px-6 bg-indigo-50">
        {/* BRAND */}
        <Animated.View
          style={{
            opacity: brandOpacity,
            transform: [{ translateY: brandTranslate }],
          }}
          className="items-center mb-16"
        >
          <Text className="text-4xl font-semibold tracking-widest text-[#1E1B4B]">
            MSPA
          </Text>
          <Text className="mt-3 text-sm text-slate-500 text-center max-w-xs">
            Smart assessments built for focused learning
          </Text>
        </Animated.View>

        {/* ACTION BUTTONS */}
        <Animated.View
          style={{
            opacity: btnOpacity,
            transform: [{ translateY: btnTranslate }],
          }}
        >
          <RoleCard
            title="Student"
            subtitle="Take tests & track progress"
            primary
            icon={<BookOpen size={22} color="#FFFFFF" />}
            onPress={() => router.replace("/auth/student?role=student")}
          />

          <RoleCard
            title="Teacher"
            subtitle="Create and manage tests"
            icon={<GraduationCap size={22} color="#4F46E5" />}
            onPress={() => router.replace("/auth/student?role=teacher")}
          />
        </Animated.View>
      </View>
    </>
  );
}
