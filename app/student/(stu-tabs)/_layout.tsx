import { Tabs } from "expo-router";

export default function StudentTabs() {
    return (
        <Tabs>
            <Tabs.Screen
                name="Test"
                options={{ title: "Test" }}
            />
            <Tabs.Screen
                name="Analytics"
                options={{ title: "Analytics" }}
            />
            <Tabs.Screen
                name="Profile"
                options={{ title: "Profile" }}
            />
            <Tabs.Screen
                name="Name"
                options={{ title: "Name" }}
            />
        </Tabs>
    );
}
