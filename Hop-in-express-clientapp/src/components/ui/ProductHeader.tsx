import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Share } from 'lucide-react-native';
import tw from '../../lib/tw';

export const ProductHeader = () => {
    return (
        <BlurView intensity={20} tint="dark" style={tw`absolute top-0 w-full z-50 pt-14 pb-4 px-6 flex-row justify-between items-center`}>
            <TouchableOpacity style={tw`w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/10`}>
                <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={tw`text-white text-lg font-heading`}>Product Detail</Text>

            <TouchableOpacity style={tw`w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/10`}>
                <Share size={20} color="#fff" />
            </TouchableOpacity>
        </BlurView>
    );
};
