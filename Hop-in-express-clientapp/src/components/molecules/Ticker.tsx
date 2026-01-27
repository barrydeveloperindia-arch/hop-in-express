import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Text, Animated, Easing } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { AlertCircle } from 'lucide-react-native';

const MESSAGES = [
    "LOGISTICS ALERT: High demand in Sector 4",
    "INVENTORY: Nano Bananas Critical",
    "RIDER STATUS: Dave is back online",
    "NEW ORDER: #8831 - £42.50 (Sam Alt)",
];

export const Ticker = () => {
    // Simple horizontal scroll implementation
    // For a true "marquee", we'd need an infinite loop animation.
    // Here we'll use a horizontal ScrollView that automatically scrolls or just a styled bar for now.

    // Let's make it a static 'urgent' bar for v1, or a simple animated text if possible.
    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = () => {
            scrollX.setValue(300); // Start off-screen right
            Animated.timing(scrollX, {
                toValue: -400, // End off-screen left
                duration: 10000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => loop());
        };
        loop();
    }, []);

    return (
        <View style={tw`bg-red-500/10 border-y border-red-500/20 h-8 overflow-hidden justify-center mb-4`}>
            <View style={tw`flex-row items-center px-4`}>
                <Animated.View style={{ transform: [{ translateX: scrollX }], flexDirection: 'row', width: 600 }}>
                    {MESSAGES.map((msg, i) => (
                        <View key={i} style={tw`flex-row items-center mr-8`}>
                            <AlertCircle size={12} color="#F87171" style={tw`mr-1`} />
                            <Typography variant="tiny" color="#F87171" style={tw`font-bold uppercase`}>{msg}</Typography>
                        </View>
                    ))}
                </Animated.View>
            </View>
        </View>
    );
};
