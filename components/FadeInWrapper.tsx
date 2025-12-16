// components/FadeInWrapper.tsx
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

type Props = {
    children: React.ReactNode;
    duration?: number;
};

export default function FadeInWrapper({ children, duration = 220 }: Props) {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: 1,
            duration,
            useNativeDriver: true,
        }).start();
    }, [opacity, duration]);

    return <Animated.View style={{ flex: 1, opacity }}>{children}</Animated.View>;
}
