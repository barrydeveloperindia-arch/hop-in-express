import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Bell, ShoppingBag } from 'lucide-react-native';
import tw from '../../lib/tw';

export const GlassHeader = () => {
    return (
        <BlurView intensity={30} tint="dark" style={tw`absolute top-0 w-full z-50 pt-14 pb-4 px-6 flex-row justify-between items-center border-b border-white/5`}>
            <View>
                <Text style={tw`text-zinc-400 text-xs font-medium uppercase tracking-widest mb-1`}>Good Evening</Text>
                <Text style={tw`text-white text-xl font-heading`}>Sam Alt.</Text>
            </View>

            <View style={tw`flex-row gap-4`}>
                <TouchableOpacity style={tw`w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/10`}>
                    <Bell size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={tw`w-10 h-10 rounded-full bg-indigo-500/20 items-center justify-center border border-indigo-500/50`}>
                    <ShoppingBag size={20} color="#6366F1" />
                    <View style={tw`absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center`}>
                        <Text style={tw`text-[9px] text-white font-bold`}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </BlurView>
    );
};
