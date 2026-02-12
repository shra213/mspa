import api from "@/api";
import { useEffect, useState } from "react";

export function useSubjectWiseResults(subjectId?: string) {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!subjectId) return;

        const fetchResults = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await api.get(
                    `/results/subject/${subjectId}/my-results`
                );
                setResults(res.data);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Failed to load results");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [subjectId]);

    return { results, loading, error };
}
