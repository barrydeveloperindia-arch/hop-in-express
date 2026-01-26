import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { COLORS } from '../../lib/theme';
import { Minus, Plus } from 'lucide-react-native';

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
    if (count === 0) {
        return (
            <TouchableOpacity
                onPress={onIncrement}
                activeOpacity={0.7}
                style={tw`bg-green-50 border border-green-600 rounded-lg px-4 py-1.5 items-center justify-center min-w-[70px] shadow-sm`}
            >
                <Typography variant="h3" color={COLORS.primary} style={tw`text-xs uppercase`}>ADD</Typography>
            </TouchableOpacity>
        );
    }

    return (
        <View style={tw`flex-row items-center bg-green-600 rounded-lg overflow-hidden h-8 min-w-[70px] justify-between shadow-sm`}>
            <TouchableOpacity onPress={onDecrement} style={tw`px-2 h-full items-center justify-center`}>
                <Minus size={14} color="#FFF" strokeWidth={3} />
            </TouchableOpacity>

            <Typography variant="h3" color="#FFF" style={tw`text-xs`}>{count}</Typography>

            <TouchableOpacity onPress={onIncrement} style={tw`px-2 h-full items-center justify-center`}>
                <Plus size={14} color="#FFF" strokeWidth={3} />
            </TouchableOpacity>
        </View>
    );
};
