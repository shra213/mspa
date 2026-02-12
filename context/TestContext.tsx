import api from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

const STORAGE_KEY = "ACTIVE_TEST_STATE";

type AnswerMap = { [questionId: string]: any };

type StoredState = {
    testId: string;
    duration: number;
    startedAt: number;
    answers: AnswerMap;
    violationCount: number;
};

type TestContextType = {
    isTestActive: boolean;
    violationCount: number;
    answers: AnswerMap;

    startTestContext: (testId: string, duration: number) => void;
    submitAnswer: (qid: string, answer: any) => void;
    incrementViolation: () => void;
    forceSubmit: (auto: boolean) => Promise<void>;
    resetTest: () => Promise<void>;
};

const TestContext = createContext<TestContextType | null>(null);

export const TestProvider = ({ children }: { children: React.ReactNode }) => {
    const [isTestActive, setIsTestActive] = useState(false);
    const [violationCount, setViolationCount] = useState(0);
    const [answers, setAnswers] = useState<AnswerMap>({});

    const testIdRef = useRef<string | null>(null);
    const durationRef = useRef<number>(0);
    const startedAtRef = useRef<number>(0);
    const submittedRef = useRef(false);

    /* ---------------- PERSIST ---------------- */
    const persist = async () => {
        if (!testIdRef.current) return;

        const data: StoredState = {
            testId: testIdRef.current,
            duration: durationRef.current,
            startedAt: startedAtRef.current,
            answers,
            violationCount,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };



    /* ---------------- RESTORE ON APP OPEN ---------------- */
    useEffect(() => {
        restoreState();

        const sub = AppState.addEventListener("change", state => {
            if (state === "background") persist();
            if (state === "active") handleResume();
        });

        return () => sub.remove();
    }, []);

    useEffect(() => {
        console.log(violationCount);
        if (violationCount >= 2 && isTestActive) {
            forceSubmit(true);
        }
    }, [violationCount]);


    const restoreState = async () => {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const data: StoredState = JSON.parse(raw);

        testIdRef.current = data.testId;
        durationRef.current = data.duration;
        startedAtRef.current = data.startedAt;

        setAnswers(data.answers);
        setViolationCount(data.violationCount);
        setIsTestActive(true);

        handleResume();
    };

    /* ---------------- RESUME / AUTO SUBMIT ---------------- */
    const handleResume = async () => {
        if (!testIdRef.current) return;

        const elapsed =
            Math.floor((Date.now() - startedAtRef.current) / 1000);

        if (elapsed >= durationRef.current * 60) {
            await forceSubmit(true); // 🔥 auto submit
        }
    };

    /* ---------------- START ---------------- */
    const startTestContext = (testId: string, duration: number) => {
        testIdRef.current = testId;
        durationRef.current = duration;
        startedAtRef.current = Date.now();
        submittedRef.current = false;

        setIsTestActive(true);
        setViolationCount(0);
        setAnswers({});
        persist();
    };

    /* ---------------- ANSWERS ---------------- */
    const submitAnswer = (qid: string, answer: any) => {
        setAnswers(prev => {
            const updated = { ...prev, [qid]: answer };
            AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    testId: testIdRef.current,
                    duration: durationRef.current,
                    startedAt: startedAtRef.current,
                    answers: updated,
                    violationCount,
                })
            );
            return updated;
        });
    };

    /* ---------------- VIOLATIONS ---------------- */
    const incrementViolation = () => {
        console.log(violationCount);
        setViolationCount(v => v + 1);
    };

    /* ---------------- SUBMIT ---------------- */
    const forceSubmit = async (autoSubmitted: boolean) => {
        if (submittedRef.current || !testIdRef.current) return;

        submittedRef.current = true;

        const formattedAnswers = Object.entries(answers).map(
            ([id, ans]: any) => ({ questionId: id, ...ans })
        );
        const opt = {
            answers: formattedAnswers,
            timeTaken:
                Math.floor((Date.now() - startedAtRef.current) / 1000),
            autoSubmitted,
        }
        console.log(opt);
        console.log(testIdRef.current);
        try {
            await api.post(`/tests/${testIdRef.current}/submit`, opt);

            await resetTest();
            router.replace("/student/(stu-tabs)/Test");
        } catch (e) {
            console.log("Submit failed", e);
            submittedRef.current = false;
        }
    };

    /* ---------------- RESET ---------------- */
    const resetTest = async () => {
        setIsTestActive(false);
        setViolationCount(0);
        setAnswers({});
        testIdRef.current = null;
        await AsyncStorage.removeItem(STORAGE_KEY);
    };

    return (
        <TestContext.Provider
            value={{
                isTestActive,
                violationCount,
                answers,
                startTestContext,
                submitAnswer,
                incrementViolation,
                forceSubmit,
                resetTest,
            }}
        >
            {children}
        </TestContext.Provider>
    );
};

export const useTest = () => {
    const ctx = useContext(TestContext);
    if (!ctx) throw new Error("useTest must be used inside provider");
    return ctx;
};
