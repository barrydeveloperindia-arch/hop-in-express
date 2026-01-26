import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';

const IMPULSE_ITEMS = [
    { name: 'Vapes', icon: 'https://images.pexels.com/photos/10352635/pexels-photo-10352635.jpeg?auto=compress&cs=tinysrgb&w=300', color: 'bg-purple-50' }, // Vape/Smoke
    { name: 'Pharma', icon: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=300', color: 'bg-blue-50' }, // Medical/Pills
    { name: 'Pet Food', icon: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=300', color: 'bg-orange-50' },
    { name: 'Munchies', icon: 'https://images.pexels.com/photos/298217/pexels-photo-298217.jpeg?auto=compress&cs=tinysrgb&w=300', color: 'bg-yellow-50' },
    { name: 'Coffee', icon: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300', color: 'bg-stone-50' },
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
