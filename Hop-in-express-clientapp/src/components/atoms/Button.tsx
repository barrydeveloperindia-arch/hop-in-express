import React from 'react';
import { TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from './Typography';
import { COLORS } from '../../lib/theme';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 's' | 'm' | 'l';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    size = 'm',
    loading = false,
    disabled = false,
    style
}) => {
    // Base Container
    let containerStyle = tw`rounded-xl items-center justify-center flex-row shadow-sm`;
    let textVariant: 'body' | 'h3' = 'h3';
    let textColor = '#FFF';

    // Variants
    switch (variant) {
        case 'primary':
            containerStyle = { ...containerStyle, backgroundColor: COLORS.primary }; // Brand Green
            break;
        case 'secondary':
            containerStyle = { ...containerStyle, backgroundColor: COLORS.textMain }; // Black
            break;
        case 'outline':
            containerStyle = { ...containerStyle, ...tw`border border-gray-200 bg-white shadow-none` };
            textColor = COLORS.primary;
            break;
        case 'ghost':
            containerStyle = { ...containerStyle, ...tw`bg-transparent shadow-none` };
            textColor = COLORS.textSub;
            textVariant = 'body';
            break;
    }

    // Sizes
    switch (size) {
        case 's': containerStyle = { ...containerStyle, ...tw`px-3 py-1.5 min-h-[32px]` }; textVariant = 'body'; break;
        case 'm': containerStyle = { ...containerStyle, ...tw`px-4 py-3 min-h-[44px]` }; break;
        case 'l': containerStyle = { ...containerStyle, ...tw`px-6 py-4 min-h-[56px]` }; break;
    }

    if (disabled) {
        containerStyle = { ...containerStyle, opacity: 0.5 };
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[containerStyle, style]}
        >
            {loading ? (
                <ActivityIndicator color={textColor} size="small" />
            ) : (
                <Typography variant={textVariant} color={textColor} bold>{label}</Typography>
            )}
        </TouchableOpacity>
    );
};
