import React from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { COLORS } from '../../lib/theme';
import { Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';

interface AddToCartButtonProps {
    count: number;
    onIncrement: () => void;
    onDecrement: () => void;
    max?: number;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    count,
    onIncrement,
    onDecrement
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const handleIncrement = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(withSpring(0.92), withSpring(1));
        onIncrement();
    };

    const handleDecrement = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // If removing the last item, give a slightly heavier vibration
        if (count === 1) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSequence(withSpring(0.92), withSpring(1));
        onDecrement();
    };

    if (count === 0) {
        return (
            <Pressable
                onPress={handleIncrement}
                style={({ pressed }) => [
                    tw`bg-green-50 border border-green-600 rounded-lg px-4 py-1.5 items-center justify-center min-w-[70px] shadow-sm`,
                    { transform: [{ scale: pressed ? 0.95 : 1 }] }
                ]}
            >
                <Typography variant="h3" color={COLORS.success} style={tw`text-xs uppercase font-black`}>ADD</Typography>
            </Pressable>
        );
    }

    return (
        <Animated.View style={[
            tw`flex-row items-center bg-green-600 rounded-lg overflow-hidden h-8 min-w-[70px] justify-between shadow-sm`,
            animatedStyle
        ]}>
            <TouchableOpacity onPress={handleDecrement} style={tw`px-2 h-full items-center justify-center bg-green-700`}>
                <Minus size={14} color="#FFF" strokeWidth={3} />
            </TouchableOpacity>

            <Typography variant="h3" color="#FFF" style={tw`text-xs font-black min-w-[20px] text-center`}>{count}</Typography>

            <TouchableOpacity onPress={handleIncrement} style={tw`px-2 h-full items-center justify-center bg-green-700`}>
                <Plus size={14} color="#FFF" strokeWidth={3} />
            </TouchableOpacity>
        </Animated.View>
    );
};
