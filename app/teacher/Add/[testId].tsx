import api from "@/api";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import {
    CheckCircle2,
    ChevronLeft,
    Circle,
    Image as ImageIcon,
    Plus,
    Send,
    Trash2
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

type Option = {
    text: string;
    isCorrect: boolean;
};

export default function AddQuestions() {
    const { testId } = useLocalSearchParams();
    const { user } = useAuth();

    const [test, setTest] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [questionText, setQuestionText] = useState("");
    const [questionType, setQuestionType] = useState<"multiple_choice" | "fill_in_blank">("multiple_choice");
    const [options, setOptions] = useState<Option[]>([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
    ]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [marks, setMarks] = useState("1");
    const [negativeMarks, setNegativeMarks] = useState("0");
    const [questionImage, setQuestionImage] = useState<any>(null);

    useEffect(() => { fetchTest(); }, [testId]);

    const fetchTest = async () => {
        try {
            const res = await api.get(`/tests/${testId}`);
            setTest(res.data);
            setQuestions(res.data.questions || []);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!result.canceled) setQuestionImage(result.assets[0]);
    };

    const addOption = () => setOptions((prev) => [...prev, { text: "", isCorrect: false }]);
    const removeOption = (index: number) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== index));
    };

    const markCorrect = (index: number) => {
        setOptions(options.map((o, i) => ({ ...o, isCorrect: i === index })));
    };

    const addQuestion = async () => {
        if (!questionText.trim()) return Alert.alert("Required", "Question text is empty");
        setSubmitting(true);

        const formData = new FormData();
        formData.append("questionText", questionText);
        formData.append("questionType", questionType);
        formData.append("marks", marks);
        formData.append("negativeMarks", negativeMarks);
        formData.append("testId", testId as string);

        if (questionImage) {
            formData.append("questionImage", {
                uri: questionImage.uri,
                name: "question.jpg",
                type: "image/jpeg",
            } as any);
        }

        if (questionType === "fill_in_blank") {
            formData.append("correctAnswer", correctAnswer);
        } else {
            if (!options.some((o) => o.isCorrect)) {
                setSubmitting(false);
                return Alert.alert("Correction Needed", "Please select a correct answer");
            }
            formData.append("options", JSON.stringify(options));
        }

        try {
            const res = await api.post("/questions", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await api.put(`/tests/${testId}`, {
                questions: [...questions.map((q) => q._id), res.data._id],
            });
            resetForm();
            fetchTest();
        } catch (err) {
            Alert.alert("Error", "Failed to add question");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setQuestionText("");
        setCorrectAnswer("");
        setMarks("1");
        setNegativeMarks("0");
        setOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
        setQuestionImage(null);
    };

    const publishTest = async () => {
        try {
            await api.put(`/tests/${testId}/publish`);
            Alert.alert("Live!", "Assessment published successfully");
            router.replace("/teacher/(tea-tabs)/Analytics");
        } catch (err) {
            Alert.alert("Error", "Publish failed");
        }
    };

    if (loading) return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator color="#1E3A8A" /></View>;

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            {/* STICKY HEADER */}
            <View className="bg-[#1E3A8A] pt-8 pb-6 px-6 rounded-b-3xl shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white/10 rounded-full">
                        <ChevronLeft size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-black text-xl">Build Test</Text>
                    <TouchableOpacity onPress={publishTest} className="bg-emerald-500 px-4 py-2 rounded-full flex-row items-center">
                        <Send size={14} color="white" />
                        {/* <Text className="text-white font-bold ml-2">Publish</Text> */}
                    </TouchableOpacity>
                </View>
                <Text className="text-white/60 text-center mt-4 font-semibold uppercase tracking-widest text-[10px]">Current Test: {test?.title}</Text>
            </View>

            <ScrollView className="flex-1 px-4 mt-4" showsVerticalScrollIndicator={false}>
                {/* QUESTION INPUT CARD */}
                <View className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-100 mb-6">
                    <Text className="text-slate-400 font-bold mb-4 uppercase text-[10px] tracking-tighter">Compose Question</Text>

                    <TextInput
                        placeholder="Type your question here..."
                        value={questionText}
                        onChangeText={setQuestionText}
                        multiline
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 font-medium min-h-[80px]"
                    />

                    {/* IMAGE UPLOADER */}
                    <Pressable onPress={pickImage} className="mt-4 flex-row items-center justify-center border-2 border-dashed border-slate-200 p-4 rounded-2xl bg-slate-50">
                        {questionImage ? (
                            <View className="w-full">
                                <Image source={{ uri: questionImage.uri }} className="h-40 w-full rounded-xl" />
                                <Text className="text-center text-blue-600 font-bold mt-2 text-xs">Change Image</Text>
                            </View>
                        ) : (
                            <>
                                <ImageIcon size={20} color="#64748b" />
                                <Text className="ml-2 text-slate-500 font-semibold">Attach Reference Image</Text>
                            </>
                        )}
                    </Pressable>

                    {/* TYPE SWITCHER */}
                    <View className="flex-row mt-6 bg-slate-100 p-1 rounded-2xl">
                        {["multiple_choice", "fill_in_blank"].map((t) => (
                            <Pressable
                                key={t}
                                onPress={() => setQuestionType(t as any)}
                                className={`flex-1 py-3 rounded-xl ${questionType === t ? 'bg-white' : ''}`}
                            >
                                <Text className={`text-center font-bold text-[10px] uppercase ${questionType === t ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {t.replace(/_/g, " ")}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* OPTIONS SECTION */}
                    <View className="mt-6">
                        {questionType === "multiple_choice" ? (
                            <>
                                {options.map((opt, i) => (
                                    <View key={i} className="flex-row items-center mb-3">
                                        <TouchableOpacity onPress={() => markCorrect(i)} className="mr-3">
                                            {opt.isCorrect ? <CheckCircle2 size={24} color="#10b981" /> : <Circle size={24} color="#cbd5e1" />}
                                        </TouchableOpacity>
                                        <TextInput
                                            value={opt.text}
                                            onChangeText={(t) => {
                                                const copy = [...options];
                                                copy[i].text = t;
                                                setOptions(copy);
                                            }}
                                            placeholder={`Option ${i + 1}`}
                                            className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100"
                                        />
                                        {options.length > 2 && (
                                            <TouchableOpacity onPress={() => removeOption(i)} className="ml-2">
                                                <Trash2 size={18} color="#f43f5e" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                                <TouchableOpacity onPress={addOption} className="flex-row items-center justify-center py-3 border border-slate-200 rounded-xl mt-2 border-dashed">
                                    <Plus size={16} color="#64748b" />
                                    <Text className="ml-2 text-slate-500 font-bold">Add Choice</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TextInput
                                placeholder="Enter correct answer..."
                                value={correctAnswer}
                                onChangeText={setCorrectAnswer}
                                className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 font-semibold"
                            />
                        )}
                    </View>

                    {/* SCORING */}
                    <View className="flex-row mt-6 gap-3">
                        <View className="flex-1 ">
                            <Text className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase">Points</Text>
                            <TextInput value={marks} onChangeText={setMarks} keyboardType="numeric" className="bg-slate-50 p-3 rounded-xl text-center font-bold border border-slate-100" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase">Penalty</Text>
                            <TextInput value={negativeMarks} onChangeText={setNegativeMarks} keyboardType="numeric" className="bg-slate-50 p-3 rounded-xl text-center font-bold border border-slate-100" />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={addQuestion}
                        disabled={submitting}
                        className={`mt-8 py-4 rounded-2xl shadow-lg flex-row justify-center items-center ${submitting ? 'bg-slate-300' : 'bg-blue-600'}`}
                    >
                        {submitting ? <ActivityIndicator color="white" /> : (
                            <>
                                <Plus size={20} color="white" />
                                <Text className="text-white font-black ml-2 uppercase tracking-widest">Add to Test</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* PREVIEW OF ADDED QUESTIONS */}
                <View className="mb-10 px-2">
                    <View className="flex-row justify-between items-end mb-4">
                        <Text className="text-slate-900 font-black text-lg">Test Preview</Text>
                        <Text className="text-blue-600 font-bold">{questions.length} Items</Text>
                    </View>

                    {questions.map((q, i) => (
                        <View key={q._id} className="bg-white p-4 mb-3 rounded-2xl border border-slate-100 flex-row items-center shadow-sm">
                            <View className="bg-blue-50 w-8 h-8 rounded-full items-center justify-center mr-4">
                                <Text className="text-blue-600 font-black text-xs">{i + 1}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-800 font-bold" numberOfLines={1}>{q.questionText}</Text>
                                <Text className="text-slate-400 text-[10px] mt-1 uppercase font-bold tracking-widest">{q.questionType.replace('_', ' ')} • {q.marks} PTS</Text>
                            </View>
                        </View>
                    ))}
                    {questions.length === 0 && (
                        <View className="items-center py-10">
                            <Text className="text-slate-300 font-bold">No questions added yet.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}