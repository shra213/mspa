import { AuthProvider } from "@/context/AuthContext";
import { TestProvider, useTest } from "@/context/TestContext";
import { Stack } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
function AppStateGuard() {
  const {
    isTestActive,
    incrementViolation,
    violationCount,
    forceSubmit,
  } = useTest();

  const prevAppState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (!isTestActive) {
        prevAppState.current = next;
        return;
      }

      if (prevAppState.current === "active" && next === "background") {
        incrementViolation();
      }

      if (prevAppState.current === "background" && next === "active") {
        if (violationCount >= 2) {
          forceSubmit(true);
        }
        Alert.alert("Warning", "You left the test. This is a violation.");
      }

      prevAppState.current = next;
    });

    return () => sub.remove();
  }, [isTestActive, violationCount]);

  return null;
}

/* ----------------ROOT LAYOUT---------------- */
export default function RootLayout() {

  return (
    <SafeAreaProvider>
      {/* <SafeAreaView> */}
      <AuthProvider>
        <TestProvider>
          {/* <AppEntry /> */}
          <AppStateGuard />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
        </TestProvider>
      </AuthProvider>
      {/* </SafeAreaView> */}
    </SafeAreaProvider>
  );
}
