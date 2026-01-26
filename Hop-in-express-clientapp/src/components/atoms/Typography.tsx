import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import tw from '../../lib/tw';
import { COLORS } from '../../lib/theme';

interface TypographyProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'price' | 'tiny';
    color?: string;
    bold?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
    children,
    variant = 'body',
    color,
    bold,
    style,
    ...props
}) => {
    let baseStyle = tw`font-body text-base text-gray-900`;

    switch (variant) {
        case 'h1': baseStyle = tw`text-2xl font-bold tracking-tight`; break;
        case 'h2': baseStyle = tw`text-lg font-bold tracking-tight`; break;
        case 'h3': baseStyle = tw`text-base font-bold`; break;
        case 'body': baseStyle = tw`text-sm font-normal`; break;
        case 'caption': baseStyle = tw`text-xs text-gray-500`; break;
        case 'tiny': baseStyle = tw`text-[10px] text-gray-400 uppercase tracking-wider`; break;
        case 'price': baseStyle = tw`text-sm font-bold text-black`; break;
    }

    if (bold) baseStyle = { ...baseStyle, ...tw`font-bold` };
    if (color) baseStyle = { ...baseStyle, color };

    return (
        <RNText style={[baseStyle, style]} {...props}>
            {children}
        </RNText>
    );
};
