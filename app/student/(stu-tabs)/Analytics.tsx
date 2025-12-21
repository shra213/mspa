import { Picker } from "@react-native-picker/picker";
import { useMemo, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const screenWidth = Dimensions.get("window").width;

// ---------------- MOCK DATA ----------------

const tests = [
    { id: 1, subject: "Maths", semester: 3, score: 78, date: "Aug 1" },
    { id: 2, subject: "DSA", semester: 3, score: 85, date: "Aug 10" },
    { id: 3, subject: "DBMS", semester: 3, score: 72, date: "Sep 1" },
    { id: 4, subject: "OS", semester: 3, score: 90, date: "Sep 15" },
];

const leaderboard = [
    { rank: 1, name: "Aman", score: 92 },
    { rank: 2, name: "Shraddha", score: 90 },
    { rank: 3, name: "Nirmitee", score: 88 },
    { rank: 4, name: "Ayush", score: 84 },
];

// ---------------- COMPONENT ----------------

export default function StudDashboard() {
    const [subject, setSubject] = useState("all");
    const [semester, setSemester] = useState("all");

    const filteredTests = useMemo(() => {
        return tests.filter(t => {
            if (subject !== "all" && t.subject !== subject) return false;
            if (semester !== "all" && String(t.semester) !== semester) return false;
            return true;
        });
    }, [subject, semester]);

    const avgScore = useMemo(() => {
        if (!filteredTests.length) return 0;
        return Math.round(
            filteredTests.reduce((a, b) => a + b.score, 0) / filteredTests.length
        );
    }, [filteredTests]);

    return (
        <ScrollView className="flex-1 bg-gray-100 p-4">
            {/* HEADER */}
            <Text className="text-2xl font-bold">Student Dashboard</Text>
            <Text className="text-gray-500 mb-4">
                Your academic performance at a glance
            </Text>

            {/* FILTERS */}
            <Card>
                <CardContent>
                    <Text className="font-semibold mb-1">Subject</Text>
                    <Picker selectedValue={subject} onValueChange={setSubject}>
                        <Picker.Item label="All Subjects" value="all" />
                        <Picker.Item label="Maths" value="Maths" />
                        <Picker.Item label="DSA" value="DSA" />
                        <Picker.Item label="DBMS" value="DBMS" />
                        <Picker.Item label="OS" value="OS" />
                    </Picker>

                    <Text className="font-semibold mt-3 mb-1">Semester</Text>
                    <Picker selectedValue={semester} onValueChange={setSemester}>
                        <Picker.Item label="All Semesters" value="all" />
                        <Picker.Item label="Semester 3" value="3" />
                    </Picker>
                </CardContent>
            </Card>

            {/* ANALYTICS */}
            <View className="flex-row justify-between mt-4">
                <Card className="w-[48%]">
                    <CardContent>
                        <Text className="text-gray-500">Average Score</Text>
                        <Text className="text-2xl font-bold">{avgScore}%</Text>
                    </CardContent>
                </Card>

                <Card className="w-[48%]">
                    <CardContent>
                        <Text className="text-gray-500">Tests Taken</Text>
                        <Text className="text-2xl font-bold">
                            {filteredTests.length}
                        </Text>
                    </CardContent>
                </Card>
            </View>

            {/* LINE CHART */}
            <Card className="mt-4">
                <CardContent>
                    <Text className="font-semibold mb-2">Performance Over Time</Text>
                    <LineChart
                        data={{
                            labels: filteredTests.map(t => t.date),
                            datasets: [{ data: filteredTests.map(t => t.score) }],
                        }}
                        width={screenWidth - 48}
                        height={220}
                        chartConfig={{
                            backgroundGradientFrom: "#fff",
                            backgroundGradientTo: "#fff",
                            decimalPlaces: 0,
                            color: () => "#4f46e5",
                            labelColor: () => "#6b7280",
                        }}
                        bezier
                    />
                </CardContent>
            </Card>

            {/* BAR CHART */}
            <Card className="mt-4">
                <CardContent>
                    <Text className="font-semibold mb-2">Subject-wise Scores</Text>
                    <BarChart
                        data={{
                            labels: filteredTests.map(t => t.subject),
                            datasets: [{ data: filteredTests.map(t => t.score) }],
                        }}
                        width={screenWidth - 48}
                        height={220}
                        fromZero
                        chartConfig={{
                            backgroundGradientFrom: "#fff",
                            backgroundGradientTo: "#fff",
                            color: () => "#16a34a",
                            labelColor: () => "#6b7280",
                        }}
                    />
                </CardContent>
            </Card>

            {/* LEADERBOARD */}
            <Card className="mt-4">
                <CardContent>
                    <Text className="font-semibold mb-3">Leaderboard</Text>
                    {leaderboard.map(user => (
                        <View
                            key={user.rank}
                            className={`flex-row justify-between p-3 rounded-xl mb-2 ${user.name === "Shraddha"
                                ? "bg-indigo-100"
                                : "bg-gray-200"
                                }`}
                        >
                            <Text>#{user.rank} {user.name}</Text>
                            <Text className="font-semibold">{user.score}%</Text>
                        </View>
                    ))}
                </CardContent>
            </Card>

            {/* ACTION */}
            <View className="mt-6">
                <Button title="View Detailed Report" onPress={() => { }} />
            </View>
        </ScrollView>
    );
}
