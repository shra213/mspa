import { backend } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Clock, FileText, Settings } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CreateTest: React.FC = () => {
    // Get subjectId from the URL params (passed from the subject detail page)
    const { subjectId } = useLocalSearchParams<{ subjectId?: string }>();

    if (!subjectId) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>Invalid subject</Text>
            </View>
        );
    }

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('30');
    const [type, setType] = useState<'self_paced' | 'teacher_controlled'>('self_paced');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title || !duration) {
            Alert.alert('Required Fields', 'Please provide a title and duration.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${backend}/tests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    duration: Number(duration),
                    questions: [],
                    type,
                    subject: subjectId, // Pass the subject context
                }),
            });

            if (!response.ok) throw new Error('Failed to create test');

            const data = await response.json();
            // Navigate to add questions for this specific test
            router.replace(`/teacher/Add/${data._id}`);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#F5F7FA]"
        >
            <View className="bg-[#1E3A8A] pt-14 pb-14 px-6 rounded-b-[40px]">
                <View className="flex-row justify-between items-center">
                    <Text className="text-white text-2xl font-black">New Assessment</Text>
                    {/* <TouchableOpacity onPress={() => router.back()} className="bg-white/20 p-2 rounded-full">
                        <X size={20} color="white" />
                    </TouchableOpacity> */}
                </View>
                <Text className="text-white/60 mt-2 font-medium">Configure your test details below</Text>
            </View>

            <ScrollView className="flex-1 px-6 -mt-6">
                <View className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-100">

                    {/* Title */}
                    <View className="mb-5">
                        <View className="flex-row items-center mb-2">
                            <FileText size={16} color="#64748b" />
                            <Text className="text-slate-500 font-bold ml-2 uppercase text-[10px] tracking-widest">Test Title</Text>
                        </View>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-semibold"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Mid-term Algebra"
                            placeholderTextColor="#CBD5E1"
                        />
                    </View>

                    {/* Duration & Type Row */}
                    <View className="mb-5">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-2">
                                <Clock size={16} color="#64748b" />
                                <Text className="text-slate-500 font-bold ml-2 uppercase text-[10px] tracking-widest">Minutes</Text>
                            </View>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-semibold"
                                value={duration}
                                onChangeText={setDuration}
                                keyboardType="numeric"
                                placeholder="30"
                            />
                        </View>
                        <View className="flex-[1.5] mt-5">
                            <View className="flex-row items-center mb-2">
                                <Settings size={16} color="#64748b" />
                                <Text className="text-slate-500 font-bold ml-2 uppercase text-[10px] tracking-widest">Mode</Text>
                            </View>
                            <View className="flex-row bg-slate-100 p-1 rounded-2xl">
                                <TouchableOpacity
                                    onPress={() => setType('self_paced')}
                                    className={`flex-1 py-3 rounded-xl ${type === 'self_paced' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <Text className={`text-center text-[10px] font-bold ${type === 'self_paced' ? 'text-blue-600' : 'text-slate-400'}`}>SELF</Text>
                                </TouchableOpacity>
                                {/* <TouchableOpacity
                                    onPress={() => setType('teacher_controlled')}
                                    className={`flex-1 py-3 rounded-xl ${type === 'teacher_controlled' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <Text className={`text-center text-[10px] font-bold ${type === 'teacher_controlled' ? 'text-blue-600' : 'text-slate-400'}`}>LIVE</Text>
                                </TouchableOpacity> */}
                                <Pressable
                                    onPress={() => setType('teacher_controlled')}
                                    className={`flex-1 py-3 rounded-xl ${type === 'teacher_controlled' ? 'bg-white' : ''}`}
                                >
                                    <Text className={`text-center text-[10px] font-bold ${type === 'teacher_controlled' ? 'text-blue-600' : 'text-slate-400'}`}>LIVE</Text>
                                </Pressable>
                                {/* <Pressable onPress={() => {
                                    setType("teacher_controlled");
                                }} className='flex-1 bg-white text-black'>
                                    <Text>
                                        Live
                                    </Text>
                                </Pressable> */}
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="mb-8">
                        <Text className="text-slate-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Instructions (Optional)</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 min-h-[100px]"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Add test instructions..."
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        className={`py-4 rounded-2xl shadow-lg shadow-blue-200 ${isSubmitting ? 'bg-slate-400' : 'bg-[#1E3A8A]'}`}
                    >
                        <Text className="text-white text-center font-black tracking-widest">
                            {isSubmitting ? 'CREATING...' : 'PROCEED TO QUESTIONS'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreateTest;