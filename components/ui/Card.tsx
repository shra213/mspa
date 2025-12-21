import { View } from "react-native";

export function Card({ children }: any) {
    return (
        <View className="bg-white rounded-2xl p-4 shadow">
            {children}
        </View>
    );
}
export function CardContent({ children }: any) {
    return <View className="mt-2">{children}</View>;
}
