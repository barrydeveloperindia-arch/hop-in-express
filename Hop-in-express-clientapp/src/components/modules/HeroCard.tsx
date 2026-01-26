import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from '../../lib/tw';

export const HeroCard = ({ title, subtitle, image, cta }: { title: string, subtitle: string, image: any, cta: string }) => {
    return (
        <TouchableOpacity activeOpacity={0.9} style={tw`mx-6 h-[420px] rounded-[32px] overflow-hidden relative shadow-2xl shadow-indigo-900/40`}>
            <Image
                source={{ uri: image }}
                style={tw`absolute w-full h-full object-cover`}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(5,5,5,0.8)', '#050505']}
                style={tw`absolute bottom-0 w-full h-[50%] justify-end pb-8 px-6`}
            >
                <View style={tw`flex-row items-center gap-2 mb-2`}>
                    <View style={tw`w-2 h-2 rounded-full bg-indigo-500`} />
                    <Text style={tw`text-indigo-400 text-xs font-bold uppercase tracking-widest`}>{subtitle}</Text>
                </View>
                <Text style={tw`text-4xl text-white font-heading mb-6 leading-tight`}>{title}</Text>

                <View style={tw`bg-white/10 self-start px-8 py-4 rounded-full border border-white/20`}>
                    <Text style={tw`text-white font-bold tracking-wider uppercase text-xs`}>{cta}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};
