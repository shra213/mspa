import { backend } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { Link, router } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from 'react-native';
import "../global.css";
export default function Home() {
  useEffect(() => {
    const bootstrapAuth = async () => {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      console.log("refresh");
      // 1️⃣ No token → login
      if (!refreshToken) {
        router.replace("/student/student");
        return;
      }

      const net = await NetInfo.fetch();

      // 2️⃣ Offline → allow app (no auth check)
      if (!net.isConnected) {
        router.replace("/student/(stu-tabs)");
        return;
      }

      // 3️⃣ Online → refresh token
      try {
        const res = await fetch(`${backend}/api/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        await AsyncStorage.setItem("token", data.accessToken);

        router.replace("/student/(stu-tabs)");
      } catch {
        // 4️⃣ Invalid token → login
        await SecureStore.deleteItemAsync("refreshToken");
        router.replace("/student/student");
      }
    };
    bootstrapAuth();
  }, []);
  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-100">
      <Text className="text-4xl font-bold text-gray-800">MSPA</Text>
      <Text className="text-base text-gray-500 mt-2 text-center">
        Online Test & Assessment
      </Text>

      <Link href="./student/student" asChild>
        <TouchableOpacity className="mt-10 bg-indigo-600 w-full py-3 rounded-xl">
          <Text className="text-white text-center text-base font-semibold">
            Student Login
          </Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity className="mt-4 border-2 border-indigo-600 w-full py-3 rounded-xl">
        <Text className="text-indigo-600 text-center text-base font-semibold">
          Teacher Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
