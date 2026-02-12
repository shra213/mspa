import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import Svg, { Path } from "react-native-svg";

// Wrap SVG Path with Animated
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function HandwritingLoader() {
    // This controls how much of the line is hidden
    const dashOffset = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(dashOffset, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: false,
                }),
                Animated.delay(400),
                Animated.timing(dashOffset, {
                    toValue: 300,
                    duration: 0,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);


    return (
        <View style={{ alignItems: "center" }}>
            <Svg width={300} height={80}>
                <AnimatedPath
                    d="M10 40 Q 60 10, 110 40 T 210 40"
                    stroke="#1e3a8a"
                    strokeWidth={3}
                    fill="none"
                    strokeDasharray={300}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                />
            </Svg>
        </View>
    );
}
