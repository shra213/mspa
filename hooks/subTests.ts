import api from "@/api";
import { useEffect, useState } from "react";

export function useSubjectWiseTests(subjectId?: string) {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTests = async () => {
        if (!subjectId) return;

        try {
            setLoading(true);
            const res = await api.get(`/tests/subject/${subjectId}`);
            setTests(res.data);
        } catch (err) {
            console.log("Fetch subject tests error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, [subjectId]);

    // 👉 refetch function (just reuse fetchTests)
    const refetchTests = () => {
        fetchTests();
    };


    return { tests, loading, refetchTests };
}
