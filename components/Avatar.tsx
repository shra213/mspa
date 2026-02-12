// import { useFonts } from "expo-font";
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    useFonts,
} from "@expo-google-fonts/inter";
import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
export default function AppLoader() {
    const [fontsLoaded] = useFonts({
        InterRegular: Inter_400Regular,
        InterMedium: Inter_500Medium,
        InterSemiBold: Inter_600SemiBold,
    });

    if (!fontsLoaded) return null;
    return (
        <View style={styles.container}>
            <LottieView
                source={require("../assets/animations/Books.json")}
                autoPlay
                loop
                style={styles.animation}
            />

            <Text style={styles.title}>MSPA</Text>
            <Text style={styles.subtitle}>
                Inspired By ByteBandits
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EEF2FF", // 👈 soft indigo
        alignItems: "center",
        justifyContent: "center",
    },

    animation: {
        width: 235,
        height: 235,
        marginBottom: 18,
    },


    title: {
        fontFamily: "InterSemiBold",
        fontSize: 23,
        fontWeight: "600",
        color: "#1E1B4B",
        letterSpacing: 1.8, // +0.2 = smoother logo feel
    },


    subtitle: {
        marginTop: 6,
        fontSize: 13,
        fontWeight: "400",
        color: "#475569",
        letterSpacing: 0.6,
        opacity: 0.85,
        fontFamily: "InterRegular",
    },

});
