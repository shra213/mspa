import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function StudentTabs() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#4f46e5", // active color
                tabBarInactiveTintColor: "#6b7280", // inactive color
                tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 0,
                    elevation: 5, // shadow for android
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                },
                headerShown: false, // hide top header if using bottom tabs
            }}
        >
            <Tabs.Screen
                name="Analytics"
                options={{
                    title: "Analytics",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="analytics" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
