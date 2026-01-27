import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import tw from '../../lib/tw';

interface CircularProgressProps {
    size?: number;
    strokeWidth?: number;
    progress: number; // 0 to 100
    color?: string;
    trackColor?: string;
    showText?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    size = 40,
    strokeWidth = 4,
    progress,
    color = '#4ADE80',
    trackColor = '#333',
    showText = true,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Track Circle */}
                <Circle
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                />

                {/* Progress Circle */}
                <Circle
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            {/* Center Text */}
            {showText && (
                <View style={tw`absolute inset-0 justify-center items-center`}>
                    <Text style={{ fontSize: size * 0.25, fontWeight: 'bold', color: 'white' }}>
                        {Math.round(progress)}%
                    </Text>
                </View>
            )}
        </View>
    );
};
