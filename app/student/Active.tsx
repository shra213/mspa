import { backend } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Pressable,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

/* ================= TYPES ================= */

type Test = {
    _id: string;
    title: string;
    description: string;
    duration: number;
    createdAt: string;
    createdBy: { _id: string; name: string };
};

type TabType = "active" | "expired";

/* ================= TEST CARD ================= */

const TestCard = React.memo(
    ({
        item,
        isExpired,
        onStart,
    }: {
        item: Test;
        isExpired: boolean;
        onStart: (id: string) => void;
    }) => {
        const scale = useRef(new Animated.Value(1)).current;

        const pressIn = () =>
            Animated.spring(scale, {
                toValue: 0.97,
                useNativeDriver: true,
            }).start();

        const pressOut = () =>
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
            }).start();

        return (
            <Animated.View
                style={[
                    styles.card,
                    isExpired ? styles.cardExpired : styles.cardActive,
                    { transform: [{ scale }] },
                ]}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            isExpired
                                ? styles.badgeExpired
                                : styles.badgeActive,
                        ]}
                    >
                        <Text style={styles.badgeText}>
                            {isExpired ? "Closed" : "Active"}
                        </Text>
                    </View>
                </View>

                {!!item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                        ⏱ {item.duration} min
                    </Text>
                    <Text style={styles.metaText}>
                        👨‍🏫 {item.createdBy?.name}
                    </Text>
                </View>

                <Text style={styles.dateText}>
                    Created on{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>

                {!isExpired && (
                    <Pressable
                        onPressIn={pressIn}
                        onPressOut={pressOut}
                        onPress={() => onStart(item._id)}
                        style={styles.startBtn}
                    >
                        <Text style={styles.startBtnText}>
                            Start Assessment
                        </Text>
                    </Pressable>
                )}
            </Animated.View>
        );
    }
);

/* ================= MAIN COMPONENT ================= */

export default function Tests({ subjectId }: { subjectId: string }) {
    const [activeTests, setActiveTests] = useState<Test[]>([]);
    const [expiredTests, setExpiredTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState<TabType>("active");

    const fetchTests = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                router.replace("/");
                return;
            }

            const res = await fetch(
                `${backend}/tests/student/subject/${subjectId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) throw new Error("Fetch failed");

            const data = await res.json();
            setActiveTests(data.activeTests || []);
            setExpiredTests(data.expiredTests || []);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTests();
    }, []);

    const listData = useMemo(
        () => (tab === "active" ? activeTests : expiredTests),
        [tab, activeTests, expiredTests]
    );

    const handleStartTest = (testId: string) => {
        router.push({
            pathname: "/student/selectedTest",
            params: { testId },
        });
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>
                    Loading assessments…
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />


            {/* <View style={styles.header}>
                <Text style={styles.headerTitle}>Assessments</Text>
                <Text style={styles.headerSub}>
                    View and manage your subject tests
                </Text>
            </View> */}

            {/* Tabs */}
            <View style={styles.tabs}>
                <Pressable
                    onPress={() => setTab("active")}
                    style={[
                        styles.tabBtn,
                        tab === "active" && styles.tabActive,
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            tab === "active" && styles.tabTextActive,
                        ]}
                    >
                        Active
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => setTab("expired")}
                    style={[
                        styles.tabBtn,
                        tab === "expired" && styles.tabActive,
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            tab === "expired" && styles.tabTextActive,
                        ]}
                    >
                        Past
                    </Text>
                </Pressable>
            </View>

            {/* List */}
            <FlatList
                data={listData}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                renderItem={({ item }) => (
                    <TestCard
                        item={item}
                        isExpired={tab === "expired"}
                        onStart={handleStartTest}
                    />
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {tab === "active"
                            ? "No active assessments available."
                            : "No past assessments found."}
                    </Text>
                }
            />
        </SafeAreaView>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    loadingText: {
        marginTop: 12,
        color: "#64748b",
        fontSize: 14,
    },

    header: {
        padding: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },

    headerTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: "#0f172a",
    },

    headerSub: {
        marginTop: 4,
        fontSize: 13,
        color: "#64748b",
    },

    tabs: {
        flexDirection: "row",
        margin: 16,
        backgroundColor: "#e2e8f0",
        borderRadius: 14,
        padding: 4,
    },

    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
    },

    tabActive: {
        backgroundColor: "#fff",
    },

    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748b",
    },

    tabTextActive: {
        color: "#2563eb",
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },

    cardActive: {
        borderLeftWidth: 4,
        borderLeftColor: "#2563eb",
    },

    cardExpired: {
        backgroundColor: "#f1f5f9",
        borderLeftWidth: 4,
        borderLeftColor: "#cbd5e1",
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    cardTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#0f172a",
        flex: 1,
        marginRight: 8,
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },

    badgeActive: { backgroundColor: "#dbeafe" },
    badgeExpired: { backgroundColor: "#e2e8f0" },

    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#2563eb",
    },

    description: {
        marginTop: 8,
        fontSize: 14,
        color: "#475569",
        lineHeight: 20,
    },

    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },

    metaText: {
        fontSize: 12,
        color: "#64748b",
    },

    dateText: {
        marginTop: 6,
        fontSize: 11,
        color: "#94a3b8",
    },

    startBtn: {
        marginTop: 16,
        backgroundColor: "#2563eb",
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: "center",
    },

    startBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },

    emptyText: {
        marginTop: 60,
        textAlign: "center",
        color: "#94a3b8",
        fontSize: 14,
    },
});
