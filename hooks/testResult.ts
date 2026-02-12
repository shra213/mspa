import api from "@/api";
import { useEffect, useState } from "react";

export function useTestResults(testId?: string) {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!testId) return;

        const fetchResults = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/results/test/${testId}`);
                setResults(res.data);
            } catch (err) {
                console.log("Fetch test results error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [testId]);

    return { results, loading };
}
