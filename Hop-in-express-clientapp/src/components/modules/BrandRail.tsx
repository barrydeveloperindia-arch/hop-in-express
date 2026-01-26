import React from 'react';
import { View, Image, ScrollView, Text } from 'react-native';
import tw from '../../lib/tw';

// Simplified logos for the Brand Rail (using text placeholders effectively if images fail, but mocked nice colors)
const BRANDS = [
    { name: 'Haldiram', color: '#EF4444', letter: 'H' },
    { name: 'Tilda', color: '#3B82F6', letter: 'T' },
    { name: 'Shan', color: '#F59E0B', letter: 'S' },
    { name: 'Rubicon', color: '#10B981', letter: 'R' },
    { name: 'Cadbury', color: '#8B5CF6', letter: 'C' },
    { name: 'Ashoka', color: '#EC4899', letter: 'A' },
];

export const BrandRail = () => {
    return (
        <View style={tw`mb-8`}>
            <Text style={tw`text-white text-lg font-bold px-6 mb-4`}>Shop by Brand</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`px-6`} style={tw`overflow-visible`}>
                {BRANDS.map((brand, i) => (
                    <View key={i} style={tw`mr-4 items-center`}>
                        <View style={tw`w-16 h-16 rounded-full bg-[${brand.color}]/20 border border-[${brand.color}]/50 items-center justify-center mb-2 shadow`}>
                            <Text style={tw`text-[${brand.color}] font-black text-2xl`}>{brand.letter}</Text>
                        </View>
                        <Text style={tw`text-zinc-400 text-[10px] font-medium uppercase tracking-wider`}>{brand.name}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};
