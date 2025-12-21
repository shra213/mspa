import { Pressable, Text } from "react-native";

export function Button({ title, onPress }: any) {
    return (
        <Pressable
            onPress={onPress}
            className="bg-indigo-600 py-3 px-4 rounded-xl active:opacity-80"
        >
            <Text className="text-white text-center font-semibold">
                {title}
            </Text>
        </Pressable>
    );
}
