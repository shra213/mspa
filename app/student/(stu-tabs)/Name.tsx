import { Text, View } from "react-native";

type UserNameProps = {
    name: string;
};

export default function UserName({ name }: UserNameProps) {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-xl font-semibold text-gray-800">
                Hello, {name} 👋
            </Text>
        </View>
    );
}
