import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';

const IMPULSE_ITEMS = [
    { name: 'Vapes', icon: 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png', color: 'bg-purple-50' },
    { name: 'Pharma', icon: 'https://cdn-icons-png.flaticon.com/512/883/883407.png', color: 'bg-blue-50' },
    { name: 'Pet Food', icon: 'https://cdn-icons-png.flaticon.com/512/616/616408.png', color: 'bg-orange-50' },
    { name: 'Muncies', icon: 'https://cdn-icons-png.flaticon.com/512/3081/3081923.png', color: 'bg-yellow-50' },
    { name: 'Coffee', icon: 'https://cdn-icons-png.flaticon.com/512/751/751663.png', color: 'bg-stone-50' },
];

export const ImpulseRail = () => {
    return (
        <View style={tw`mb-6 pl-4`}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {IMPULSE_ITEMS.map((item, i) => (
                    <TouchableOpacity key={i} style={tw`mr-4 items-center`}>
                        <View style={tw`w-14 h-14 rounded-full ${item.color} items-center justify-center mb-1 border border-gray-100`}>
                            <Image source={{ uri: item.icon }} style={tw`w-7 h-7 opacity-90`} />
                        </View>
                        <Typography variant="tiny" style={tw`text-[10px] text-gray-600 font-medium normal-case`}>
                            {item.name}
                        </Typography>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};
