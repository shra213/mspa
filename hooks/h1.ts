import api from "@/api";
import { useEffect, useState } from "react";

export type Subject = {
    _id?: string;
    name: string;
    code?: string;
};

export function useTeacherSubjects(autoFetch = true) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    /* ================= FETCH SUBJECTS ================= */
    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const res = await api.get("/tests/list-subjects");

            setSubjects(
                Array.isArray(res.data)
                    ? res.data.map((s: any) => ({
                        _id: s._id,
                        name: s.name,
                        code: s.code,
                    }))
                    : []
            );
        } catch (err) {
            console.log("Fetch subjects error:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ================= ADD SUBJECT ================= */
    const addSubject = async (name: string) => {
        if (!name.trim()) return;

        try {
            setAdding(true);
            const res = await api.post("/tests/addSubject", {
                subject: name,
            });

            // optimistic update
            setSubjects((prev) => [
                ...prev,
                {
                    _id: res.data._id,
                    name: res.data.name,
                    code: res.data.code,
                },
            ]);
        } catch (err) {
            console.log("Add subject error:", err);
        } finally {
            setAdding(false);
        }
    };

    /* ================= AUTO FETCH ================= */
    useEffect(() => {
        if (autoFetch) fetchSubjects();
    }, []);

    return {
        subjects,
        loading,
        adding,
        fetchSubjects,
        addSubject,
    };
}
