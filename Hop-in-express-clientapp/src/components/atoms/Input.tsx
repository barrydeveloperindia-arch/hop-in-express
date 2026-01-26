import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Search } from 'lucide-react-native';
import tw from '../../lib/tw';
import { COLORS } from '../../lib/theme';

interface InputProps extends TextInputProps {
    icon?: React.ReactNode;
    containerStyle?: any;
}

export const Input: React.FC<InputProps> = ({ style, containerStyle, icon, ...props }) => {
    return (
        <View style={[tw`flex-row items-center bg-gray-100 rounded-xl px-4 h-12 border border-transparent focus:border-green-600`, containerStyle]}>
            {icon && <View style={tw`mr-3`}>{icon}</View>}
            <TextInput
                placeholderTextColor={COLORS.textMuted}
                style={[tw`flex-1 text-base text-black h-full`, style]}
                selectionColor={COLORS.primary}
                {...props}
            />
        </View>
    );
};
