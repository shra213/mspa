import { backend } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useState } from 'react';
import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Student() {
    const [isLogin, setIsLogin] = useState(false);
    const [token, setToken] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const handleAuth = async () => {
        setLoading(true);

        const url = isLogin
            ? `${backend}/api/auth/login`
            : `${backend}/api/auth/register`;

        const body = isLogin
            ? { email, password }
            : { name, email, role: 'student', password };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const text = await response.text();
            const data = JSON.parse(text);

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            await AsyncStorage.setItem('token', data.accessToken);
            await SecureStore.setItemAsync("refreshToken", data.refreshToken);

            router.replace('./(stu-tabs)');

            Alert.alert(
                'Success',
                isLogin ? 'Login successful' : 'Signup successful'
            );
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center bg-[#f5f7fb] px-5">
            <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
                {isLogin ? 'Student Login' : 'Student Signup'}
            </Text>

            {!isLogin && (
                <TextInput
                    placeholder="Full Name"
                    className="bg-white p-4 rounded-xl mb-4 text-base border border-gray-200"
                    value={name}
                    onChangeText={setName}
                />
            )}

            <TextInput
                placeholder="Student ID"
                className="bg-white p-4 rounded-xl mb-4 text-base border border-gray-200"
                value={studentId}
                onChangeText={setStudentId}
            />

            <TextInput
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white p-4 rounded-xl mb-4 text-base border border-gray-200"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                placeholder="Password"
                secureTextEntry
                className="bg-white p-4 rounded-xl mb-4 text-base border border-gray-200"
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                className="bg-indigo-600 py-4 rounded-xl mt-2"
                onPress={handleAuth}
                disabled={loading}
            >
                <Text className="text-white text-center text-base font-semibold">
                    {loading ? 'Please wait...' : isLogin ? 'Login' : 'Signup'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text className="text-center text-indigo-600 mt-5 font-medium">
                    {isLogin
                        ? "Don't have an account? Sign up"
                        : 'Already have an account? Login'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
